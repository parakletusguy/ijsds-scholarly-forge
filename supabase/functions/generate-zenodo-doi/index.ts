import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { submissionId, existingDoi } = await req.json()
    
    if (!submissionId) {
      throw new Error('Missing submissionId')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get submission and article data
    const { data: submission, error: submissionError } = await supabaseClient
      .from('submissions')
      .select(`
        *,
        articles (
          id,
          title,
          abstract,
          authors,
          keywords,
          subject_area,
          manuscript_file_url
        )
      `)
      .eq('id', submissionId)
      .single()

    if (submissionError || !submission) {
      throw new Error('Failed to fetch submission data')
    }

    const article = submission.articles
    if (!article) {
      throw new Error('No article found for submission')
    }

    // Prepare Zenodo metadata
    const zenodoMetadata = {
      metadata: {
        title: article.title,
        description: article.abstract,
        creators: Array.isArray(article.authors) ? article.authors.map((author: any) => ({
          name: author.name,
          affiliation: author.affiliation || ''
        })) : [],
        keywords: article.keywords || [],
        subjects: article.subject_area ? [{ term: article.subject_area }] : [],
        upload_type: 'publication',
        publication_type: 'article',
        access_right: 'open',
        license: 'cc-by'
      }
    }

    const zenodoToken = Deno.env.get('ZENODO_API_TOKEN')
    if (!zenodoToken) {
      throw new Error('Zenodo API token not configured')
    }

    let deposition: any;

    // If there's an existing DOI, edit the existing record (no new version, same DOI)
    if (existingDoi) {
      console.log('Editing existing Zenodo record with DOI:', existingDoi)
      
      // Get the deposition ID from the DOI
      const doiParts = existingDoi.split('zenodo.')
      if (doiParts.length < 2) {
        throw new Error('Invalid Zenodo DOI format')
      }
      const depositionId = doiParts[1]
      
      console.log('Extracted deposition ID:', depositionId)
      
      // Unlock the published record for editing (keeps same DOI)
      const editResponse = await fetch(`https://zenodo.org/api/deposit/depositions/${depositionId}/actions/edit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${zenodoToken}`
        }
      })

      if (!editResponse.ok) {
        const errorText = await editResponse.text()
        console.error('Zenodo edit API error:', errorText)
        throw new Error(`Failed to unlock Zenodo record for editing: ${editResponse.status}`)
      }

      deposition = await editResponse.json()
      console.log('Record unlocked for editing, deposition ID:', deposition.id)
      
      // Delete old files before uploading new ones
      if (deposition.files && deposition.files.length > 0) {
        console.log('Deleting', deposition.files.length, 'old files')
        for (const file of deposition.files) {
          try {
            const deleteResponse = await fetch(`https://zenodo.org/api/deposit/depositions/${deposition.id}/files/${file.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${zenodoToken}`
              }
            })
            
            if (deleteResponse.ok) {
              console.log('Successfully deleted file:', file.filename)
            } else {
              const errorText = await deleteResponse.text()
              console.warn('Failed to delete file:', file.filename, 'Error:', errorText)
            }
          } catch (error) {
            console.warn('Error deleting file:', file.filename, error)
          }
        }
      }

      // Update metadata
      const updateResponse = await fetch(`https://zenodo.org/api/deposit/depositions/${deposition.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${zenodoToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(zenodoMetadata)
      })

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        console.error('Failed to update metadata:', errorText)
      } else {
        console.log('Metadata updated successfully')
      }
    } else {
      // Create new deposition in Zenodo
      const depositionResponse = await fetch('https://zenodo.org/api/deposit/depositions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${zenodoToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(zenodoMetadata)
      })

      if (!depositionResponse.ok) {
        const errorText = await depositionResponse.text()
        console.error('Zenodo API error:', errorText)
        throw new Error(`Failed to create Zenodo deposition: ${depositionResponse.status}`)
      }

      deposition = await depositionResponse.json()
      console.log('Created Zenodo deposition:', deposition.id)
    }

    // Upload file if manuscript URL is available
    if (article.manuscript_file_url) {
      try {
        console.log('Downloading manuscript from:', article.manuscript_file_url)
        // Download the manuscript file
        const fileResponse = await fetch(article.manuscript_file_url)
        if (fileResponse.ok) {
          const fileBlob = await fileResponse.blob()
          const fileName = `${article.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
          
          console.log('Uploading file to Zenodo:', fileName, 'Size:', fileBlob.size, 'bytes')
          
          // Upload to Zenodo
          const formData = new FormData()
          formData.append('file', fileBlob, fileName)
          
          const uploadResponse = await fetch(`https://zenodo.org/api/deposit/depositions/${deposition.id}/files`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${zenodoToken}`
            },
            body: formData
          })

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            console.log('File uploaded successfully:', uploadResult.filename)
          } else {
            const errorText = await uploadResponse.text()
            console.error('Failed to upload file to Zenodo. Status:', uploadResponse.status, 'Error:', errorText)
            throw new Error(`File upload failed: ${uploadResponse.status}`)
          }
        } else {
          console.error('Failed to download manuscript file. Status:', fileResponse.status)
          throw new Error('Failed to download manuscript file')
        }
      } catch (fileError) {
        console.error('Error handling file upload:', fileError)
        throw fileError // Don't continue if file upload fails
      }
    }

    // Publish the deposition to get DOI
    const publishResponse = await fetch(`https://zenodo.org/api/deposit/depositions/${deposition.id}/actions/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${zenodoToken}`
      }
    })

    if (!publishResponse.ok) {
      const errorText = await publishResponse.text()
      console.error('Failed to publish deposition:', errorText)
      throw new Error(`Failed to publish Zenodo deposition: ${publishResponse.status}`)
    }

    const publishedDeposition = await publishResponse.json()
    const doi = publishedDeposition.doi
    const conceptDoi = publishedDeposition.conceptdoi || doi

    console.log('✅ Publication successful!')
    console.log('DOI:', doi)
    console.log('Concept DOI:', conceptDoi)

    // Always use the DOI from the published deposition (same for new and updates)
    const finalDoi = existingDoi || doi
    
    console.log('Final DOI:', finalDoi)

    // Only update article status and DOI for new DOIs (not when updating existing records)
    if (!existingDoi) {
      console.log('Updating article with new DOI')
      const { error: updateError } = await supabaseClient
        .from('articles')
        .update({ 
          status: 'accepted',
          doi: finalDoi 
        })
        .eq('id', article.id)

      if (updateError) {
        console.error('Failed to update article with DOI:', updateError)
        throw new Error('Failed to update article with DOI')
      }
    } else {
      console.log('Updating existing DOI - content updated, DOI unchanged')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        doi: finalDoi,
        zenodo_id: publishedDeposition.id,
        zenodo_url: publishedDeposition.links.record_html,
        is_update: !!existingDoi,
        message: existingDoi 
          ? 'DOI content updated successfully (same DOI, updated file)'
          : 'New DOI created successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error generating Zenodo DOI:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error instanceof Error ? error.message : 'Failed to generate DOI')
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})