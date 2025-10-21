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

    // If there's an existing DOI, verify it's a concept DOI and update if needed
    if (existingDoi) {
      console.log('Article already has DOI:', existingDoi)
      
      try {
        // Extract the record ID from the DOI (format: 10.5281/zenodo.XXXXXX)
        const recordId = existingDoi.split('/').pop()?.replace('zenodo.', '') || ''
        
        // Fetch the record details from Zenodo
        console.log('Fetching Zenodo record ID:', recordId)
        const recordResponse = await fetch(`https://zenodo.org/api/records/${recordId}`, {
          headers: {
            'Authorization': `Bearer ${zenodoToken}`
          }
        })

        if (recordResponse.ok) {
          const recordData = await recordResponse.json()
          const conceptDoi = recordData.conceptdoi
          
          console.log('Retrieved concept DOI from Zenodo:', conceptDoi)
          
          // Check if the stored DOI is different from the concept DOI
          if (existingDoi !== conceptDoi) {
            console.log('Stored DOI is a version DOI, updating to concept DOI')
            
            // Update the database with the concept DOI
            const { error: updateError } = await supabaseClient
              .from('articles')
              .update({ doi: conceptDoi })
              .eq('id', article.id)

            if (updateError) {
              console.error('Failed to update article with concept DOI:', updateError)
            } else {
              console.log('✅ Database updated with concept DOI:', conceptDoi)
            }

            return new Response(
              JSON.stringify({ 
                success: true, 
                doi: conceptDoi,
                concept_doi: conceptDoi,
                was_updated: true,
                old_doi: existingDoi,
                message: 'Updated to use concept DOI (persistent across versions)'
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 
              }
            )
          }
          
          // Already has concept DOI, no update needed
          console.log('DOI is already a concept DOI, no update needed')
          return new Response(
            JSON.stringify({ 
              success: true, 
              doi: conceptDoi,
              concept_doi: conceptDoi,
              is_existing: true,
              message: 'Using existing concept DOI (points to latest version on Zenodo)'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        } else {
          console.log('Could not fetch Zenodo record, returning existing DOI')
          return new Response(
            JSON.stringify({ 
              success: true, 
              doi: existingDoi,
              concept_doi: existingDoi,
              is_existing: true,
              message: 'Using existing DOI'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        }
      } catch (error) {
        console.error('Error checking/updating DOI:', error)
        // Return existing DOI on error
        return new Response(
          JSON.stringify({ 
            success: true, 
            doi: existingDoi,
            concept_doi: existingDoi,
            is_existing: true,
            message: 'Using existing DOI'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    // Create new deposition in Zenodo (only for first-time DOI generation)
    console.log('Creating new Zenodo deposition for first-time DOI generation')
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
    console.log('Version DOI:', doi)
    console.log('Concept DOI (persistent across versions):', conceptDoi)

    // Store the concept DOI - it's persistent and always points to latest version
    const doiToStore = conceptDoi || doi
    
    console.log('Storing concept DOI in database:', doiToStore)

    // Update article with the concept DOI (or version DOI if concept not available)
    const { error: updateError } = await supabaseClient
      .from('articles')
      .update({ 
        status: 'accepted',
        doi: doiToStore 
      })
      .eq('id', article.id)

    if (updateError) {
      console.error('Failed to update article with DOI:', updateError)
      throw new Error('Failed to update article with DOI')
    }
    
    console.log('✅ Database updated with concept DOI:', doiToStore)

    return new Response(
      JSON.stringify({ 
        success: true, 
        doi: doiToStore,
        version_doi: doi,
        concept_doi: conceptDoi,
        zenodo_id: publishedDeposition.id,
        zenodo_url: publishedDeposition.links.record_html,
        message: `Concept DOI created: ${doiToStore}`
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