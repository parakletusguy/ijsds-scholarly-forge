import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface NotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  emailNotification?: boolean;
  emailTemplate?: 'submission_received' | 'review_assigned' | 'decision_made' | 'article_published';
  emailData?: Record<string, any>;
}

const emailTemplates = {
  submission_received: {
    subject: 'Submission Received - {{title}}',
    content: `
      <h2>Submission Received Successfully</h2>
      <p>Dear {{authorName}},</p>
      <p>Thank you for submitting your manuscript titled "<strong>{{title}}</strong>" to the International Journal of Social Work and Development Studies.</p>
      <p><strong>Submission Details:</strong></p>
      <ul>
        <li>Submission ID: {{submissionId}}</li>
        <li>Title: {{title}}</li>
        <li>Submitted on: {{submissionDate}}</li>
      </ul>
      <p>Your manuscript will undergo an initial editorial review to ensure it meets our journal's scope and quality standards. You will be notified of our decision within 2-3 weeks.</p>
      <p>Best regards,<br>Editorial Team<br>International Journal of Social Work and Development Studies</p>
    `,
  },
  review_assigned: {
    subject: 'Review Assignment - {{title}}',
    content: `
      <h2>Review Assignment</h2>
      <p>Dear {{reviewerName}},</p>
      <p>You have been invited to review the manuscript titled "<strong>{{title}}</strong>" for the International Journal of Social Work and Development Studies.</p>
      <p><strong>Review Details:</strong></p>
      <ul>
        <li>Manuscript ID: {{submissionId}}</li>
        <li>Title: {{title}}</li>
        <li>Review Deadline: {{deadline}}</li>
      </ul>
      <p>Please log in to your reviewer dashboard to accept or decline this invitation.</p>
      <p>Thank you for your contribution to scholarly publishing.</p>
      <p>Best regards,<br>Editorial Team</p>
    `,
  },
  decision_made: {
    subject: 'Editorial Decision - {{title}}',
    content: `
      <h2>Editorial Decision</h2>
      <p>Dear {{authorName}},</p>
      <p>We have completed the review process for your manuscript titled "<strong>{{title}}</strong>".</p>
      <p><strong>Decision:</strong> {{decision}}</p>
      {{#if decisionRationale}}
      <p><strong>Editor's Comments:</strong></p>
      <p>{{decisionRationale}}</p>
      {{/if}}
      <p>Please log in to your dashboard to view the detailed reviews and our decision letter.</p>
      <p>Best regards,<br>Editorial Team</p>
    `,
  },
  article_published: {
    subject: 'Article Published - {{title}}',
    content: `
      <h2>Your Article Has Been Published!</h2>
      <p>Dear {{authorName}},</p>
      <p>Congratulations! Your article titled "<strong>{{title}}</strong>" has been published in the International Journal of Social Work and Development Studies.</p>
      <p><strong>Publication Details:</strong></p>
      <ul>
        <li>DOI: {{doi}}</li>
        <li>Volume: {{volume}}</li>
        <li>Issue: {{issue}}</li>
        <li>Publication Date: {{publicationDate}}</li>
      </ul>
      <p>Your article is now available online and accessible to the global research community.</p>
      <p>Thank you for choosing our journal for your publication.</p>
      <p>Best regards,<br>Editorial Team</p>
    `,
  },
};

const sendEmailNotification = async (userEmail: string, template: string, data: Record<string, any>) => {
  if (!resendApiKey) {
    console.log('Resend API key not configured, skipping email');
    return;
  }

  try {
    const templateConfig = emailTemplates[template as keyof typeof emailTemplates];
    if (!templateConfig) {
      throw new Error('Invalid email template');
    }

    // Simple template replacement
    let subject = templateConfig.subject;
    let htmlContent = templateConfig.content;

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
    });

    const response = await fetch('https://api.resend.com/v3/smtp/emails', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': resendApiKey,
      },
      body: JSON.stringify({
    from: 'International Journal of Social Work and Development Studies <noreply@ijsds.org>',
    to: [userEmail],
    subject,
    html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const createNotification = async (notificationData: NotificationRequest) => {
  try {
    // Create in-app notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }

    // Send email notification if requested
    if (notificationData.emailNotification && notificationData.emailTemplate) {
      // Get user email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email, email_notifications_enabled')
        .eq('id', notificationData.userId)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        throw userError;
      }

      if (user && user.email_notifications_enabled) {
        await sendEmailNotification(
          user.email,
          notificationData.emailTemplate,
          notificationData.emailData || {}
        );

        // Log email notification
        await supabase.from('email_notifications').insert({
          recipient_email: user.email,
          recipient_id: notificationData.userId,
          subject: notificationData.title,
          body: notificationData.message,
          notification_type: notificationData.emailTemplate,
          status: 'sent',
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in notification service:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notificationData: NotificationRequest = await req.json();
    console.log('Processing notification:', notificationData);

    const result = await createNotification(notificationData);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in notification service:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});