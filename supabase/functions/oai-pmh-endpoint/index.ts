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
    const url = new URL(req.url);
    const verb = url.searchParams.get('verb');
    const metadataPrefix = url.searchParams.get('metadataPrefix');
    const identifier = url.searchParams.get('identifier');
    const from = url.searchParams.get('from');
    const until = url.searchParams.get('until');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let xmlResponse = '';

    switch (verb) {
      case 'Identify':
        xmlResponse = generateIdentifyResponse();
        break;
      
      case 'ListMetadataFormats':
        xmlResponse = generateListMetadataFormatsResponse();
        break;
      
      case 'ListRecords':
        const { data: articles, error } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('publication_date', { ascending: false });

        if (error) throw error;
        xmlResponse = generateListRecordsResponse(articles, metadataPrefix);
        break;
      
      case 'GetRecord':
        if (!identifier) {
          xmlResponse = generateErrorResponse('badArgument', 'Missing identifier');
          break;
        }
        
        const { data: article, error: articleError } = await supabase
          .from('articles')
          .select('*')
          .eq('doi', identifier.replace('oai:ijsds:', ''))
          .eq('status', 'published')
          .single();

        if (articleError || !article) {
          xmlResponse = generateErrorResponse('idDoesNotExist', 'Record not found');
        } else {
          xmlResponse = generateGetRecordResponse(article, metadataPrefix);
        }
        break;
      
      default:
        xmlResponse = generateErrorResponse('badVerb', 'Unknown verb');
    }

    return new Response(xmlResponse, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/xml; charset=utf-8' 
      },
    });

  } catch (error) {
    console.error('Error in OAI-PMH endpoint:', error);
    const errorResponse = generateErrorResponse('badRequest', error instanceof Error ? error.message : 'An unknown error occurred');
    return new Response(errorResponse, {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/xml; charset=utf-8' 
      },
    });
  }
});

function generateIdentifyResponse(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/">
  <responseDate>${new Date().toISOString()}</responseDate>
  <request verb="Identify">https://your-domain.supabase.co/functions/v1/oai-pmh-endpoint</request>
  <Identify>
    <repositoryName>International Journal of Social and Data Sciences</repositoryName>
    <baseURL>https://your-domain.supabase.co/functions/v1/oai-pmh-endpoint</baseURL>
    <protocolVersion>2.0</protocolVersion>
    <adminEmail>admin@ijsds.org</adminEmail>
    <earliestDatestamp>2024-01-01T00:00:00Z</earliestDatestamp>
    <deletedRecord>no</deletedRecord>
    <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>
  </Identify>
</OAI-PMH>`;
}

function generateListMetadataFormatsResponse(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/">
  <responseDate>${new Date().toISOString()}</responseDate>
  <request verb="ListMetadataFormats">https://your-domain.supabase.co/functions/v1/oai-pmh-endpoint</request>
  <ListMetadataFormats>
    <metadataFormat>
      <metadataPrefix>oai_dc</metadataPrefix>
      <schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>
      <metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace>
    </metadataFormat>
  </ListMetadataFormats>
</OAI-PMH>`;
}

function generateListRecordsResponse(articles: any[], metadataPrefix: string | null): string {
  if (metadataPrefix !== 'oai_dc') {
    return generateErrorResponse('cannotDisseminateFormat', 'Unsupported metadata format');
  }

  let records = '';
  articles.forEach(article => {
    records += generateRecordXML(article);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/">
  <responseDate>${new Date().toISOString()}</responseDate>
  <request verb="ListRecords" metadataPrefix="oai_dc">https://your-domain.supabase.co/functions/v1/oai-pmh-endpoint</request>
  <ListRecords>
    ${records}
  </ListRecords>
</OAI-PMH>`;
}

function generateGetRecordResponse(article: any, metadataPrefix: string | null): string {
  if (metadataPrefix !== 'oai_dc') {
    return generateErrorResponse('cannotDisseminateFormat', 'Unsupported metadata format');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/">
  <responseDate>${new Date().toISOString()}</responseDate>
  <request verb="GetRecord" identifier="oai:ijsds:${article.doi}" metadataPrefix="oai_dc">https://your-domain.supabase.co/functions/v1/oai-pmh-endpoint</request>
  <GetRecord>
    ${generateRecordXML(article)}
  </GetRecord>
</OAI-PMH>`;
}

function generateRecordXML(article: any): string {
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

  return `<record>
      <header>
        <identifier>oai:ijsds:${article.doi}</identifier>
        <datestamp>${new Date(article.publication_date || article.created_at).toISOString()}</datestamp>
      </header>
      <metadata>
        <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>${escapeXml(article.title || '')}</dc:title>
          <dc:creator>${formatAuthors(article.authors)}</dc:creator>
          <dc:subject>${escapeXml((article.keywords || []).join(', '))}</dc:subject>
          <dc:description>${escapeXml(article.abstract || '')}</dc:description>
          <dc:publisher>International Journal of Social and Data Sciences</dc:publisher>
          <dc:date>${article.publication_date || article.created_at}</dc:date>
          <dc:type>Text</dc:type>
          <dc:format>application/pdf</dc:format>
          <dc:identifier>doi:${article.doi}</dc:identifier>
          <dc:identifier>${article.manuscript_file_url || ''}</dc:identifier>
          <dc:language>en</dc:language>
          <dc:rights>Creative Commons Attribution 4.0 International License</dc:rights>
        </oai_dc:dc>
      </metadata>
    </record>`;
}

function generateErrorResponse(code: string, message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/">
  <responseDate>${new Date().toISOString()}</responseDate>
  <request>https://your-domain.supabase.co/functions/v1/oai-pmh-endpoint</request>
  <error code="${code}">${message}</error>
</OAI-PMH>`;
}