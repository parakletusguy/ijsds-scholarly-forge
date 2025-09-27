import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dataType: 'submissions' | 'reviews' | 'articles' | 'users';
  dateFrom?: string;
  dateTo?: string;
  includeMetadata: boolean;
  includeComments: boolean;
}

const generateCSV = (data: any[], headers: string[]): string => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  ).join('\n');
  
  return `${csvHeaders}\n${csvRows}`;
};

const exportSubmissions = async (options: ExportOptions) => {
  let query = supabase
    .from('submissions')
    .select(`
      *,
      article:articles(*),
      submitter:profiles(full_name, email)
    `);

  if (options.dateFrom) {
    query = query.gte('submitted_at', options.dateFrom);
  }
  if (options.dateTo) {
    query = query.lte('submitted_at', options.dateTo);
  }

  const { data, error } = await query.order('submitted_at', { ascending: false });
  if (error) throw error;

  const processedData = data?.map(submission => ({
    id: submission.id,
    title: submission.article?.title || '',
    submitter_name: submission.submitter?.full_name || '',
    submitter_email: submission.submitter?.email || '',
    status: submission.status,
    submitted_at: submission.submitted_at,
    ...(options.includeMetadata && {
      submission_type: submission.submission_type,
      approved_by_editor: submission.approved_by_editor,
    }),
    ...(options.includeComments && {
      cover_letter: submission.cover_letter,
      editor_notes: submission.editor_notes,
    }),
  })) || [];

  return processedData;
};

const exportReviews = async (options: ExportOptions) => {
  let query = supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles(full_name, email),
      submission:submissions(article:articles(title))
    `);

  if (options.dateFrom) {
    query = query.gte('created_at', options.dateFrom);
  }
  if (options.dateTo) {
    query = query.lte('created_at', options.dateTo);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  const processedData = data?.map(review => ({
    id: review.id,
    article_title: review.submission?.article?.title || '',
    reviewer_name: review.reviewer?.full_name || '',
    reviewer_email: review.reviewer?.email || '',
    status: review.invitation_status,
    recommendation: review.recommendation,
    submitted_at: review.submitted_at,
    deadline_date: review.deadline_date,
    ...(options.includeComments && {
      comments_to_author: review.comments_to_author,
      comments_to_editor: review.comments_to_editor,
    }),
  })) || [];

  return processedData;
};

const exportArticles = async (options: ExportOptions) => {
  let query = supabase
    .from('articles')
    .select('*');

  if (options.dateFrom) {
    query = query.gte('publication_date', options.dateFrom);
  }
  if (options.dateTo) {
    query = query.lte('publication_date', options.dateTo);
  }

  const { data, error } = await query.order('publication_date', { ascending: false });
  if (error) throw error;

  const processedData = data?.map(article => ({
    id: article.id,
    title: article.title,
    authors: Array.isArray(article.authors) 
      ? article.authors.map((a: any) => a.name).join('; ') 
      : '',
    status: article.status,
    submission_date: article.submission_date,
    publication_date: article.publication_date,
    doi: article.doi,
    volume: article.volume,
    issue: article.issue,
    ...(options.includeMetadata && {
      subject_area: article.subject_area,
      keywords: Array.isArray(article.keywords) ? article.keywords.join('; ') : '',
    }),
  })) || [];

  return processedData;
};

const exportUsers = async (options: ExportOptions) => {
  let query = supabase
    .from('profiles')
    .select('*');

  if (options.dateFrom) {
    query = query.gte('created_at', options.dateFrom);
  }
  if (options.dateTo) {
    query = query.lte('created_at', options.dateTo);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  const processedData = data?.map(user => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    affiliation: user.affiliation,
    is_editor: user.is_editor,
    is_reviewer: user.is_reviewer,
    created_at: user.created_at,
    ...(options.includeMetadata && {
      orcid_id: user.orcid_id,
      email_notifications_enabled: user.email_notifications_enabled,
    }),
  })) || [];

  return processedData;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { options }: { options: ExportOptions } = await req.json();

    let data: any[] = [];
    let filename = '';

    switch (options.dataType) {
      case 'submissions':
        data = await exportSubmissions(options);
        filename = `submissions_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'reviews':
        data = await exportReviews(options);
        filename = `reviews_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'articles':
        data = await exportArticles(options);
        filename = `articles_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'users':
        data = await exportUsers(options);
        filename = `users_export_${new Date().toISOString().split('T')[0]}`;
        break;
      default:
        throw new Error('Invalid data type');
    }

    if (data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No data found for export' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const headers = Object.keys(data[0]);
    let content = '';
    let contentType = '';

    switch (options.format) {
      case 'csv':
        content = generateCSV(data, headers);
        contentType = 'text/csv';
        filename += '.csv';
        break;
      case 'excel':
        // For Excel, we'll return CSV format with Excel-specific headers
        content = generateCSV(data, headers);
        contentType = 'application/vnd.ms-excel';
        filename += '.csv';
        break;
      case 'pdf':
        // For PDF, we'll return JSON data that the frontend can convert
        content = JSON.stringify({ data, headers });
        contentType = 'application/json';
        filename += '.json';
        break;
      default:
        throw new Error('Invalid format');
    }

    // Create a data URL for download
    const base64Content = btoa(content);
    const downloadUrl = `data:${contentType};base64,${base64Content}`;

    return new Response(
      JSON.stringify({ 
        downloadUrl,
        filename,
        rowCount: data.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});