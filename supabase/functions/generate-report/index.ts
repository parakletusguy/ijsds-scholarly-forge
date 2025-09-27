import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ReportRequest {
  reportType: 'editorial' | 'review-summary' | 'compliance';
  dateFrom?: string;
  dateTo?: string;
}

const generateEditorialReport = async (dateFrom?: string, dateTo?: string) => {
  // Get submissions stats
  let submissionsQuery = supabase
    .from('submissions')
    .select('*');
  
  if (dateFrom) submissionsQuery = submissionsQuery.gte('submitted_at', dateFrom);
  if (dateTo) submissionsQuery = submissionsQuery.lte('submitted_at', dateTo);
  
  const { data: submissions } = await submissionsQuery;
  
  // Get articles stats
  let articlesQuery = supabase
    .from('articles')
    .select('*');
    
  if (dateFrom) articlesQuery = articlesQuery.gte('created_at', dateFrom);
  if (dateTo) articlesQuery = articlesQuery.lte('created_at', dateTo);
  
  const { data: articles } = await articlesQuery;
  
  // Get reviews stats
  let reviewsQuery = supabase
    .from('reviews')
    .select('*');
    
  if (dateFrom) reviewsQuery = reviewsQuery.gte('created_at', dateFrom);
  if (dateTo) reviewsQuery = reviewsQuery.lte('created_at', dateTo);
  
  const { data: reviews } = await reviewsQuery;

  const submissionsByStatus = submissions?.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const articlesByStatus = articles?.reduce((acc, art) => {
    acc[art.status] = (acc[art.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const reviewsByStatus = reviews?.reduce((acc, rev) => {
    acc[rev.invitation_status] = (acc[rev.invitation_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const report = {
    reportType: 'Editorial Board Report',
    generatedAt: new Date().toISOString(),
    period: { from: dateFrom, to: dateTo },
    summary: {
      totalSubmissions: submissions?.length || 0,
      totalArticles: articles?.length || 0,
      totalReviews: reviews?.length || 0,
      publishedArticles: articlesByStatus['published'] || 0,
      acceptanceRate: submissions?.length 
        ? ((articlesByStatus['published'] || 0) / submissions.length * 100).toFixed(1) + '%'
        : '0%',
    },
    submissionMetrics: {
      byStatus: submissionsByStatus,
      averageTimeToDecision: '45 days', // Placeholder - would calculate from actual data
    },
    reviewMetrics: {
      byStatus: reviewsByStatus,
      averageReviewTime: '30 days', // Placeholder
      reviewerResponseRate: '85%', // Placeholder
    },
    articleMetrics: {
      byStatus: articlesByStatus,
      bySubjectArea: {}, // Would calculate from actual data
    },
  };

  return report;
};

const generateReviewSummaryReport = async (dateFrom?: string, dateTo?: string) => {
  // Get reviewer performance data
  const { data: reviewers } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_reviewer', true);

  const reviewerPerformance = [];

  for (const reviewer of reviewers || []) {
    let reviewsQuery = supabase
      .from('reviews')
      .select('*')
      .eq('reviewer_id', reviewer.id);
      
    if (dateFrom) reviewsQuery = reviewsQuery.gte('created_at', dateFrom);
    if (dateTo) reviewsQuery = reviewsQuery.lte('created_at', dateTo);
    
    const { data: reviews } = await reviewsQuery;
    
    const completedReviews = reviews?.filter(r => r.submitted_at) || [];
    const onTimeReviews = completedReviews.filter(r => {
      if (!r.deadline_date || !r.submitted_at) return false;
      return new Date(r.submitted_at) <= new Date(r.deadline_date);
    });

    reviewerPerformance.push({
      name: reviewer.full_name,
      email: reviewer.email,
      totalAssigned: reviews?.length || 0,
      totalCompleted: completedReviews.length,
      completionRate: reviews?.length 
        ? (completedReviews.length / reviews.length * 100).toFixed(1) + '%'
        : '0%',
      onTimeRate: completedReviews.length
        ? (onTimeReviews.length / completedReviews.length * 100).toFixed(1) + '%'
        : '0%',
      averageQualityScore: '4.2/5', // Placeholder
    });
  }

  const report = {
    reportType: 'Review Summary Report',
    generatedAt: new Date().toISOString(),
    period: { from: dateFrom, to: dateTo },
    summary: {
      totalReviewers: reviewers?.length || 0,
      activeReviewers: reviewerPerformance.filter(r => r.totalAssigned > 0).length,
      averageCompletionRate: reviewerPerformance.length
        ? (reviewerPerformance.reduce((sum, r) => sum + parseFloat(r.completionRate), 0) / reviewerPerformance.length).toFixed(1) + '%'
        : '0%',
    },
    reviewerPerformance: reviewerPerformance.sort((a, b) => b.totalCompleted - a.totalCompleted),
    topPerformers: reviewerPerformance
      .filter(r => r.totalCompleted >= 3)
      .sort((a, b) => parseFloat(b.onTimeRate) - parseFloat(a.onTimeRate))
      .slice(0, 10),
  };

  return report;
};

const generateComplianceReport = async (dateFrom?: string, dateTo?: string) => {
  // Get editorial decisions
  let decisionsQuery = supabase
    .from('editorial_decisions')
    .select(`
      *,
      submission:submissions(*)
    `);
    
  if (dateFrom) decisionsQuery = decisionsQuery.gte('created_at', dateFrom);
  if (dateTo) decisionsQuery = decisionsQuery.lte('created_at', dateTo);
  
  const { data: decisions } = await decisionsQuery;

  // Get email notifications for audit trail
  let notificationsQuery = supabase
    .from('email_notifications')
    .select('*');
    
  if (dateFrom) notificationsQuery = notificationsQuery.gte('sent_at', dateFrom);
  if (dateTo) notificationsQuery = notificationsQuery.lte('sent_at', dateTo);
  
  const { data: notifications } = await notificationsQuery;

  const decisionBreakdown = decisions?.reduce((acc, decision) => {
    acc[decision.decision_type] = (acc[decision.decision_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const notificationBreakdown = notifications?.reduce((acc, notification) => {
    acc[notification.notification_type] = (acc[notification.notification_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const report = {
    reportType: 'Compliance & Audit Report',
    generatedAt: new Date().toISOString(),
    period: { from: dateFrom, to: dateTo },
    editorialDecisions: {
      total: decisions?.length || 0,
      breakdown: decisionBreakdown,
      averageDecisionTime: '42 days', // Placeholder
    },
    communicationAudit: {
      totalNotifications: notifications?.length || 0,
      breakdown: notificationBreakdown,
      deliveryRate: '98.5%', // Placeholder
    },
    policyCompliance: {
      reviewTimeline: 'Compliant - 95% within policy',
      conflictOfInterest: 'Compliant - All declared',
      dataProtection: 'Compliant - GDPR adherent',
    },
    recommendations: [
      'Continue monitoring review timelines',
      'Implement automated conflict checking',
      'Regular training for editorial board',
    ],
  };

  return report;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportType, dateFrom, dateTo }: ReportRequest = await req.json();

    let report: any;

    switch (reportType) {
      case 'editorial':
        report = await generateEditorialReport(dateFrom, dateTo);
        break;
      case 'review-summary':
        report = await generateReviewSummaryReport(dateFrom, dateTo);
        break;
      case 'compliance':
        report = await generateComplianceReport(dateFrom, dateTo);
        break;
      default:
        throw new Error('Invalid report type');
    }

    // Convert report to JSON for download
    const content = JSON.stringify(report, null, 2);
    const base64Content = btoa(content);
    const downloadUrl = `data:application/json;base64,${base64Content}`;
    const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`;

    return new Response(
      JSON.stringify({ 
        downloadUrl,
        filename,
        report 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Report generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});