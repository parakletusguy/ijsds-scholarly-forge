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
    let isNewVersion = false;

    // If there's an existing DOI, create a new version instead
    if (existingDoi) {
      console.log('Updating existing Zenodo record with DOI:', existingDoi)
      
      // Get the deposition ID from the DOI
      const doiParts = existingDoi.split('zenodo.')
      if (doiParts.length < 2) {
        throw new Error('Invalid Zenodo DOI format')
      }
      const depositionId = doiParts[1]
      
      // Create a new version
      const newVersionResponse = await fetch(`https://zenodo.org/api/deposit/depositions/${depositionId}/actions/newversion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${zenodoToken}`
        }
      })

      if (!newVersionResponse.ok) {
        const errorText = await newVersionResponse.text()
        console.error('Zenodo new version API error:', errorText)
        throw new Error(`Failed to create new Zenodo version: ${newVersionResponse.status}`)
      }

      const versionData = await newVersionResponse.json()
      const latestDraftUrl = versionData.links.latest_draft
      
      // Get the new draft deposition
      const draftResponse = await fetch(latestDraftUrl, {
        headers: {
          'Authorization': `Bearer ${zenodoToken}`
        }
      })

      if (!draftResponse.ok) {
        throw new Error('Failed to get draft deposition')
      }

      deposition = await draftResponse.json()
      isNewVersion = true
      
      // Delete old files from the new version draft
      if (deposition.files && deposition.files.length > 0) {
        for (const file of deposition.files) {
          await fetch(`https://zenodo.org/api/deposit/depositions/${deposition.id}/files/${file.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${zenodoToken}`
            }
          })
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
        // Download the manuscript file
        const fileResponse = await fetch(article.manuscript_file_url)
        if (fileResponse.ok) {
          const fileBlob = await fileResponse.blob()
          
          // Upload to Zenodo
          const formData = new FormData()
          formData.append('file', fileBlob, `${article.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)
          
          const uploadResponse = await fetch(`https://zenodo.org/api/deposit/depositions/${deposition.id}/files`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${zenodoToken}`
            },
            body: formData
          })

          if (uploadResponse.ok) {
            console.log('File uploaded successfully')
          } else {
            console.warn('Failed to upload file to Zenodo')
          }
        }
      } catch (fileError) {
        console.warn('Error uploading file:', fileError)
        // Continue without file upload
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
    const versionDoi = publishedDeposition.doi
    const conceptDoi = publishedDeposition.conceptdoi || versionDoi

    console.log('Generated version DOI:', versionDoi)
    console.log('Concept DOI:', conceptDoi)

    // If updating existing version, keep the original DOI; if new, use concept DOI
    let doiToStore = existingDoi || conceptDoi

    // Update article with DOI (only update if it's a new DOI)
    const updateData: any = { status: 'accepted' }
    if (!existingDoi) {
      updateData.doi = doiToStore
    }

    const { error: updateError } = await supabaseClient
      .from('articles')
      .update(updateData)
      .eq('id', article.id)

    if (updateError) {
      console.error('Failed to update article with DOI:', updateError)
      throw new Error('Failed to update article with DOI')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        doi: doiToStore,
        version_doi: versionDoi,
        concept_doi: conceptDoi,
        zenodo_id: publishedDeposition.id,
        zenodo_url: publishedDeposition.links.record_html,
        is_new_version: isNewVersion
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