// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
// };
// // Helper function to extract Zenodo ID from DOI
// function extractZenodoId(doi) {
//   const cleanDoi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '');
//   const match = cleanDoi.match(/zenodo\.(\d+)/);
//   if (!match) {
//     throw new Error(`Invalid Zenodo DOI format: ${doi}. Expected format: 10.5281/zenodo.12345`);
//   }
//   return match[1];
// }
// serve(async (req)=>{
//   if (req.method === 'OPTIONS') {
//     return new Response(null, {
//       headers: corsHeaders
//     });
//   }
//   try {
//     const { submissionId, existingDoi } = await req.json();
//     if (!submissionId) {
//       throw new Error('Missing submissionId');
//     }
//     const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
//     // Get submission and article data
//     const { data: submission, error: submissionError } = await supabaseClient.from('submissions').select(`
//         *,
//         articles (
//           id,
//           title,
//           abstract,
//           authors,
//           keywords,
//           subject_area,
//           manuscript_file_url
//         )
//       `).eq('id', submissionId).single();
//     if (submissionError || !submission) {
//       throw new Error('Failed to fetch submission data');
//     }
//     const article = submission.articles;
//     if (!article) {
//       throw new Error('No article found for submission');
//     }
//     // Prepare Zenodo metadata
//     const zenodoMetadata = {
//       metadata: {
//         title: article.title,
//         description: article.abstract,
//         creators: Array.isArray(article.authors) ? article.authors.map((author)=>({
//             name: author.name,
//             affiliation: author.affiliation || ''
//           })) : [],
//         keywords: article.keywords || [],
//         subjects: article.subject_area ? [
//           {
//             term: article.subject_area
//           }
//         ] : [],
//         upload_type: 'publication',
//         publication_type: 'article',
//         access_right: 'open',
//         license: 'cc-by'
//       }
//     };
//     const zenodoToken = Deno.env.get('ZENODO_API_TOKEN');
//     if (!zenodoToken) {
//       throw new Error('Zenodo API token not configured');
//     }
//     let deposition;
//     let isUpdatingExisting = false;
//     // If there's an existing DOI, create a new DRAFT to edit the existing record
//     if (existingDoi) {
//       console.log('Updating existing Zenodo record with DOI:', existingDoi);
//       const depositionId = extractZenodoId(existingDoi);
//       console.log('Extracted deposition ID:', depositionId);
//       // Step 1: Create a new draft from the published record (to edit it)
//       const editResponse = await fetch(`https://zenodo.org/api/deposit/depositions/${depositionId}/actions/edit`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${zenodoToken}`
//         }
//       });
//       if (!editResponse.ok) {
//         const errorText = await editResponse.text();
//         console.error('Failed to create edit draft:', errorText);
//         if (editResponse.status === 403) {
//           throw new Error('Permission denied: You may not own this Zenodo record');
//         } else if (editResponse.status === 404) {
//           throw new Error('Record not found: Check if the DOI is correct');
//         } else if (editResponse.status === 400) {
//           throw new Error('Cannot edit: Record may already be in draft state or not published');
//         }
//         throw new Error(`Failed to create edit draft: ${editResponse.status} - ${errorText}`);
//       }
//       deposition = await editResponse.json();
//       isUpdatingExisting = true;
//       console.log('Edit draft created for deposition:', deposition.id);
//       // Step 2: Delete old files
//       if (deposition.files && deposition.files.length > 0) {
//         console.log(`Deleting ${deposition.files.length} old files`);
//         for (const file of deposition.files){
//           const deleteResponse = await fetch(`https://zenodo.org/api/deposit/depositions/${deposition.id}/files/${file.id}`, {
//             method: 'DELETE',
//             headers: {
//               'Authorization': `Bearer ${zenodoToken}`
//             }
//           });
//           if (deleteResponse.ok) {
//             console.log(`Deleted file: ${file.filename}`);
//           } else {
//             console.warn(`Failed to delete file: ${file.filename}`);
//           }
//         }
//       }
//       // Step 3: Update metadata
//       const updateResponse = await fetch(`https://zenodo.org/api/deposit/depositions/${deposition.id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${zenodoToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(zenodoMetadata)
//       });
//       if (!updateResponse.ok) {
//         const errorText = await updateResponse.text();
//         console.error('Failed to update metadata:', errorText);
//         throw new Error('Failed to update metadata');
//       }
//       console.log('Metadata updated successfully');
//     } else {
//       // Create brand new deposition
//       console.log('Creating new Zenodo deposition');
//       const depositionResponse = await fetch('https://zenodo.org/api/deposit/depositions', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${zenodoToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(zenodoMetadata)
//       });
//       if (!depositionResponse.ok) {
//         const errorText = await depositionResponse.text();
//         console.error('Zenodo API error:', errorText);
//         throw new Error(`Failed to create Zenodo deposition: ${depositionResponse.status} - ${errorText}`);
//       }
//       deposition = await depositionResponse.json();
//       console.log('Created new Zenodo deposition:', deposition.id);
//     }
//     // Upload new file if manuscript URL is available
//     if (article.manuscript_file_url) {
//       console.log('Uploading manuscript file...');
//       try {
//         const fileResponse = await fetch(article.manuscript_file_url);
//         if (fileResponse.ok) {
//           const fileBlob = await fileResponse.blob();
//           const fileName = `${article.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
//           const formData = new FormData();
//           formData.append('file', fileBlob, fileName);
//           const uploadResponse = await fetch(`https://zenodo.org/api/deposit/depositions/${deposition.id}/files`, {
//             method: 'POST',
//             headers: {
//               'Authorization': `Bearer ${zenodoToken}`
//             },
//             body: formData
//           });
//           if (uploadResponse.ok) {
//             console.log('File uploaded successfully:', fileName);
//           } else {
//             const uploadError = await uploadResponse.text();
//             console.warn('Failed to upload file to Zenodo:', uploadError);
//           }
//         } else {
//           console.warn('Failed to download manuscript file from storage');
//         }
//       } catch (fileError) {
//         console.warn('Error uploading file:', fileError);
//       }
//     }
//     // Publish the deposition
//     console.log('Publishing deposition...');
//     const publishResponse = await fetch(`https://zenodo.org/api/deposit/depositions/${deposition.id}/actions/publish`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${zenodoToken}`
//       }
//     });
//     if (!publishResponse.ok) {
//       const errorText = await publishResponse.text();
//       console.error('Failed to publish deposition:', errorText);
//       throw new Error(`Failed to publish: ${publishResponse.status} - ${errorText}`);
//     }
//     const publishedDeposition = await publishResponse.json();
//     const doi = publishedDeposition.doi;
//     const conceptDoi = publishedDeposition.conceptdoi || doi;
//     console.log('✅ Publication successful!');
//     console.log('DOI:', doi);
//     console.log('Concept DOI:', conceptDoi);
//     // Only update database for NEW records (not when updating existing ones)
//     if (!existingDoi) {
//       const { error: updateError } = await supabaseClient.from('articles').update({
//         status: 'accepted',
//         doi: conceptDoi
//       }).eq('id', article.id);
//       if (updateError) {
//         console.error('Failed to update article with DOI:', updateError);
//         throw new Error('Failed to update article with DOI');
//       }
//       console.log('Article updated with DOI in database');
//     } else {
//       console.log('Skipping database update (updating existing DOI)');
//     }
//     return new Response(JSON.stringify({
//       success: true,
//       doi: doi,
//       concept_doi: conceptDoi,
//       zenodo_id: publishedDeposition.id,
//       zenodo_url: publishedDeposition.links.record_html,
//       is_update: isUpdatingExisting,
//       message: isUpdatingExisting ? `Successfully updated existing record. DOI remains: ${doi}` : `New record created with DOI: ${conceptDoi}`
//     }), {
//       headers: {
//         ...corsHeaders,
//         'Content-Type': 'application/json'
//       },
//       status: 200
//     });
//   } catch (error) {
//     console.error('Error with Zenodo DOI:', error);
//     return new Response(JSON.stringify({
//       success: false,
//       error: error instanceof Error ? error.message : 'Failed to process DOI'
//     }), {
//       headers: {
//         ...corsHeaders,
//         'Content-Type': 'application/json'
//       },
//       status: 500
//     });
//   }
// });


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to robustly extract the numerical Zenodo ID from a DOI string or URL
function extractZenodoId(doi: string): string {
  // Cleans up DOI URLs or prefixes like '10.5281/zenodo.'
  const cleanDoi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '').replace(/^[^\/]+\/zenodo\./, '');
  const recordId = cleanDoi.match(/^\d+$/);
  if (!recordId) {
    throw new Error(`Invalid Zenodo DOI or ID format: ${doi}`);
  }
  return recordId[0];
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
      console.error('Supabase fetch error:', submissionError);
      throw new Error('Failed to fetch submission data');
    }

    const article = submission.articles;
    if (!article) {
      throw new Error('No article found for this submission');
    }

    // Prepare Zenodo metadata from the article
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
        license: 'cc-by-sa-4.0'
      }
    };

    const zenodoToken = Deno.env.get('ZENODO_API_TOKEN');
    if (!zenodoToken) {
      throw new Error('Zenodo API token not configured');
    }
    
    const zenodoApiUrl = Deno.env.get('ZENODO_API_URL') || 'https://zenodo.org/api';
    console.log(`Using Zenodo API base URL: ${zenodoApiUrl}`);

    let deposition: any;
    let isNewVersion = false;

    // --- REVAMPED LOGIC FOR RESILIENT VERSIONING ---
    if (existingDoi) {
      console.log(`Starting update for existing DOI: ${existingDoi}`);

      // 1. Find the concept ID from the provided DOI.
      const initialRecordId = extractZenodoId(existingDoi);
      const initialRecordResponse = await fetch(`${zenodoApiUrl}/records/${initialRecordId}`);
      if (!initialRecordResponse.ok) throw new Error(`Could not find record for ID ${initialRecordId} on Zenodo.`);
      const initialRecord = await initialRecordResponse.json();
      const conceptrecid = initialRecord.conceptrecid;
      console.log(`Found Concept ID: ${conceptrecid}`);

      // 2. **NEW**: Check if an unsubmitted draft already exists for this concept.
      const draftSearchResponse = await fetch(`${zenodoApiUrl}/deposit/depositions?q=conceptrecid:${conceptrecid}&status=unsubmitted`, {
        headers: { 'Authorization': `Bearer ${zenodoToken}` }
      });
      const existingDrafts = await draftSearchResponse.json();

      if (existingDrafts && existingDrafts.length > 0) {
        // 2a. If a draft exists, reuse it.
        deposition = existingDrafts[0];
        isNewVersion = true;
        console.log(`Found existing unsubmitted draft ID: ${deposition.id}. Reusing it.`);
      } else {
        // 2b. If no draft exists, create a new one.
        console.log('No existing draft found. Creating a new version...');
        // Find the ID of the LATEST published version using the concept ID.
        const searchResponse = await fetch(`${zenodoApiUrl}/records/?q=conceptrecid:${conceptrecid}&sort=version&size=1&all_versions=true`);
        if (!searchResponse.ok) throw new Error('Failed to search for the latest version.');
        const searchData = await searchResponse.json();
        if (!searchData.hits.hits.length) throw new Error('No published versions found for this concept.');
        const latestPublishedId = searchData.hits.hits[0].id;
        console.log(`Found latest published version ID: ${latestPublishedId}`);

        // Create a new version DRAFT from the latest published version.
        const newVersionResponse = await fetch(`${zenodoApiUrl}/deposit/depositions/${latestPublishedId}/actions/newversion`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${zenodoToken}` }
        });
        if (!newVersionResponse.ok) {
          const err = await newVersionResponse.json();
          throw new Error(`Failed to create new version draft: ${err.message || 'A validation error occurred.'}`);
        }
        
        const newVersionData = await newVersionResponse.json();
        const latestDraftUrl = newVersionData.links.latest_draft;
        
        // Fetch the new draft to work with it.
        const draftResponse = await fetch(latestDraftUrl, { headers: { 'Authorization': `Bearer ${zenodoToken}` }});
        deposition = await draftResponse.json();
        isNewVersion = true;
        console.log(`Created new draft with ID: ${deposition.id}.`);
      }

      // 3. Unlock the draft for editing (safe to run even if already unlocked).
      await fetch(`${zenodoApiUrl}/deposit/depositions/${deposition.id}/actions/edit`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${zenodoToken}` }
      });
      console.log(`Unlocked draft ID: ${deposition.id} for editing.`);

      // 4. Delete old files from the draft.
      if (deposition.files && deposition.files.length > 0) {
        console.log(`Deleting ${deposition.files.length} old file(s)...`);
        for (const file of deposition.files) {
          await fetch(`${zenodoApiUrl}/deposit/depositions/${deposition.id}/files/${file.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${zenodoToken}` }
          });
        }
      }

    } else {
      // Create a brand new deposition (no existing DOI)
      console.log('Creating a new Zenodo deposition...');
      const depositionResponse = await fetch(`${zenodoApiUrl}/deposit/depositions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${zenodoToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!depositionResponse.ok) throw new Error('Failed to create initial deposition.');
      deposition = await depositionResponse.json();
      console.log(`New deposition created with ID: ${deposition.id}`);
    }

    // Update metadata for the draft (new or versioned)
    console.log(`Updating metadata for deposition ID: ${deposition.id}...`);
    await fetch(`${zenodoApiUrl}/deposit/depositions/${deposition.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${zenodoToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(zenodoMetadata)
    });
    
    // Upload the new manuscript file
    if (article.manuscript_file_url) {
      console.log('Uploading manuscript file...');
      const fileResponse = await fetch(article.manuscript_file_url);
      const fileBlob = await fileResponse.blob();
      const fileName = `${article.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      
      const uploadUrl = deposition.links.bucket + `/${encodeURIComponent(fileName)}`;
      const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${zenodoToken}`, 'Content-Type': 'application/octet-stream' },
          body: fileBlob
      });
      if (!uploadResponse.ok) throw new Error('Failed to upload manuscript file to Zenodo.');
      console.log('File uploaded successfully.');
    }

    // Publish the deposition to finalize it
    console.log(`Publishing deposition ID: ${deposition.id}...`);
    const publishResponse = await fetch(`${zenodoApiUrl}/deposit/depositions/${deposition.id}/actions/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${zenodoToken}` }
    });
    if (!publishResponse.ok) {
      const err = await publishResponse.json();
      throw new Error(`Failed to publish Zenodo deposition: ${err.message}`);
    }

    const publishedDeposition = await publishResponse.json();
    const versionDoi = publishedDeposition.doi;
    const conceptDoi = publishedDeposition.conceptdoi;

    console.log('✅ Publication Successful!');
    console.log('   Version DOI:', versionDoi);
    console.log('   Concept DOI:', conceptDoi);

    // ALWAYS update the database with the Concept DOI to ensure consistency.
    console.log('Updating Supabase with the Concept DOI...');
    const { error: updateError } = await supabaseClient
      .from('articles')
      .update({ doi: conceptDoi, status: 'accepted' })
      .eq('id', article.id);

    if (updateError) {
      throw new Error('Failed to update article with Concept DOI in database.');
    }

    return new Response(
      JSON.stringify({
        success: true,
        doi: conceptDoi,
        version_doi: versionDoi,
        zenodo_url: publishedDeposition.links.html,
        message: isNewVersion ? `Successfully created new version for ${conceptDoi}` : `New record created with DOI ${conceptDoi}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Unhandled error in Zenodo function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

