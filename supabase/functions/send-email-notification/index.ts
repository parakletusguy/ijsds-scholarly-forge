
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.198.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailRequest {
  to: string;
  subject: string;
  htmlContent: string;
  templateId?: number;
  params?: Record<string, any>;
  type?: string;
  userId?: string;
  submissionId?: string;
  reviewId?: string;
}

const sendResendEmail = async (emailData: EmailRequest) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'IJSDS <editor.ijsds@gmail.com>', // Must be a verified sender in Resend
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.htmlContent,
    }),
  });

    if (!response.ok) {
    const error = await response.text();
    console.error('Resend API error:', error);
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
};

const logEmailNotification = async (emailData: EmailRequest) => {
  try {
    await supabase.from('email_notifications').insert({
      recipient_email: emailData.to,
      subject: emailData.subject,
      body: emailData.htmlContent,
      notification_type: emailData.type || 'general',
      recipient_id: emailData.userId,
      related_submission_id: emailData.submissionId,
      related_review_id: emailData.reviewId,
      status: 'sent',
    });
  } catch (error) {
    console.error('Error logging email notification:', error);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();
    console.log('Sending email notification:', emailData);

    const result = await sendResendEmail(emailData);
    await logEmailNotification(emailData);

    console.log('Email sent successfully:', result);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-email-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
