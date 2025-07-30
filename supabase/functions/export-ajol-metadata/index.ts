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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { format = 'xml' } = await req.json();

    // Fetch published articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('publication_date', { ascending: false });

    if (error) throw error;

    let content: string;

    if (format === 'xml') {
      content = generateAJOLXML(articles);
    } else {
      content = JSON.stringify(articles, null, 2);
    }

    return new Response(JSON.stringify({ 
      success: true,
      content,
      count: articles.length,
      format
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error exporting AJOL metadata:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateAJOLXML(articles: any[]): string {
  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const formatAuthors = (authors: any) => {
    if (!authors) return '';
    if (typeof authors === 'string') return escapeXml(authors);
    if (Array.isArray(authors)) {
      return authors.map(author => {
        if (typeof author === 'string') return escapeXml(author);
        return escapeXml(`${author.firstName || ''} ${author.lastName || ''}`.trim());
      }).join('; ');
    }
    return '';
  };

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<articles xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <journal>
    <journal_title>International Journal of Social and Data Sciences</journal_title>
    <issn>1234-5678</issn>
    <publisher>IJSDS Publisher</publisher>
  </journal>
`;

  articles.forEach(article => {
    xml += `  <article>
    <title>${escapeXml(article.title || '')}</title>
    <authors>${formatAuthors(article.authors)}</authors>
    <abstract>${escapeXml(article.abstract || '')}</abstract>
    <keywords>${escapeXml((article.keywords || []).join(', '))}</keywords>
    <doi>${escapeXml(article.doi || '')}</doi>
    <publication_date>${article.publication_date || article.created_at}</publication_date>
    <volume>${article.volume || ''}</volume>
    <issue>${article.issue || ''}</issue>
    <page_start>${article.page_start || ''}</page_start>
    <page_end>${article.page_end || ''}</page_end>
    <subject_area>${escapeXml(article.subject_area || '')}</subject_area>
    <corresponding_author_email>${escapeXml(article.corresponding_author_email || '')}</corresponding_author_email>
    <manuscript_url>${escapeXml(article.manuscript_file_url || '')}</manuscript_url>
  </article>
`;
  });

  xml += '</articles>';
  return xml;
}