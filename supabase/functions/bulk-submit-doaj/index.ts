import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

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
        errors.push(`Article ${article.id}: ${getErrorMessage(articleError)}`);
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
      error: getErrorMessage(error),
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const ORCID_REGEX = /^\d{4}-\d{4}-\d{4}-[\dX]{4}$/;

function stripHtml(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function sanitizeAffiliation(affiliation?: string | null): string {
  if (!affiliation) return "";
  return stripHtml(affiliation.replace(EMAIL_REGEX, "").trim().replace(/\s{2,}/g, " "));
}

function normalizeOrcid(orcid?: string | null): string | undefined {
  if (!orcid || !orcid.trim()) return undefined;
  const clean = orcid.trim().replace(/^https?:\/\/orcid\.org\//i, "").trim();
  return ORCID_REGEX.test(clean) ? `https://orcid.org/${clean}` : undefined;
}

function formatDOAJMetadata(article: any) {
  const authors = Array.isArray(article.authors) 
    ? article.authors 
    : typeof article.authors === 'string' 
      ? [{ name: article.authors }]
      : [{ name: 'Unknown Author' }];

  const pubDate = new Date(article.publication_date || article.created_at || Date.now());
  const cleanAuthors = authors.map((author: any) => {
    const rawName = typeof author === 'string'
      ? author
      : `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.name || 'Author';

    const cleanAff = sanitizeAffiliation(author.affiliation);
    const orcid = normalizeOrcid(author.orcid || author.orcid_id);

    return {
      name: stripHtml(rawName),
      affiliation: cleanAff || undefined,
      orcid_id: orcid,
      // NO EMAIL: DOAJ strictly forbids author emails in metadata payloads
    };
  });

  const identifiers: Array<{ type: string; id: string }> = [
    { type: "pissn", id: "3115-6940" },
    { type: "eissn", id: "3115-6932" },
  ];

  if (article.doi) {
    identifiers.unshift({ type: "doi", id: article.doi });
  }

  const fullTextUrl = article.manuscript_file_url || `https://ijsds.org/articles/${article.slug || article.id}`;
  const keywords = Array.isArray(article.keywords)
    ? article.keywords.map((k: string) => stripHtml(k)).filter(Boolean)
    : [];

  return {
    admin: {
      in_doaj: true,
    },
    bibjson: {
      title: stripHtml(article.title),
      author: cleanAuthors,
      abstract: stripHtml(article.abstract || ''),
      keywords: keywords,
      identifier: identifiers,
      link: [
        {
          type: "fulltext",
          url: fullTextUrl,
          content_type: "application/pdf"
        }
      ],
      year: pubDate.getFullYear().toString(),
      month: (pubDate.getMonth() + 1).toString(),
      start_page: article.page_start ? article.page_start.toString() : undefined,
      end_page: article.page_end ? article.page_end.toString() : undefined,
      journal: {
        title: "International Journal of Social Work and Development Studies",
        publisher: "International Journal of Social Work and Development Studies",
        country: "NG",
        volume: article.volume ? article.volume.toString() : undefined,
        number: article.issue ? article.issue.toString() : undefined,
        issns: ["3115-6940", "3115-6932"],
        language: ["EN"],
        license: [
          {
            type: "CC BY",
            title: "CC BY",
            url: "https://creativecommons.org/licenses/by/4.0/",
            version: "4.0",
            open_access: true
          }
        ]
      }
    }
  };
}