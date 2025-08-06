import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const doajApiKey = Deno.env.get('DOAJ_API_KEY');

    if (!doajApiKey) {
      throw new Error('DOAJ API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { status = 'published' } = await req.json();

    // Fetch articles to submit to DOAJ
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', status)
      .not('doi', 'is', null);

    if (error) throw error;

    let successCount = 0;
    const errors = [];

    // Submit each article to DOAJ
    for (const article of articles) {
      try {
        const doajMetadata = formatDOAJMetadata(article);
        
        const response = await fetch('https://doaj.org/api/v3/articles', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${doajApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(doajMetadata),
        });

        if (response.ok) {
          successCount++;
          
          // Update article with DOAJ submission status
          await supabase
            .from('articles')
            .update({ 
              status: 'published',
              updated_at: new Date().toISOString()
            })
            .eq('id', article.id);
        } else {
          const errorData = await response.text();
          errors.push(`Article ${article.id}: ${errorData}`);
        }
      } catch (articleError) {
        errors.push(`Article ${article.id}: ${articleError.message}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      count: successCount,
      total: articles.length,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bulk DOAJ submission:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function formatDOAJMetadata(article: any) {
  const authors = Array.isArray(article.authors) 
    ? article.authors 
    : typeof article.authors === 'string' 
      ? [{ name: article.authors }]
      : [{ name: 'Unknown Author' }];

  return {
    bibjson: {
      title: article.title,
      author: authors.map((author: any) => ({
        name: typeof author === 'string' ? author : `${author.firstName || ''} ${author.lastName || ''}`.trim(),
        affiliation: author.affiliation || ''
      })),
      abstract: article.abstract,
      keywords: article.keywords || [],
      identifier: [
        {
          type: "doi",
          id: article.doi
        }
      ],
      link: [
        {
          type: "fulltext",
          url: article.manuscript_file_url || ''
        }
      ],
      year: new Date(article.publication_date || article.created_at).getFullYear().toString(),
      month: (new Date(article.publication_date || article.created_at).getMonth() + 1).toString(),
      journal: {
        title: "International Journal of Social and Data Sciences",
        country: "US",
        language: ["en"],
        license: [
          {
            type: "CC BY",
            url: "https://creativecommons.org/licenses/by/4.0/"
          }
        ]
      }
    }
  };
}