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
  emailTemplate?: 'user_welcome' | 'author_welcome' | 'submission_received' | 'fee_information' | 'review_assigned' | 'decision_made' | 'article_published' | 'submission_accepted' | 'payment_confirmed' | 'payment_received_editor' | 'payment_pending_editor';
  emailData?: Record<string, any>;
}

const emailTemplates = {
  user_welcome: {
    subject: 'Welcome to International Journal of Social Work and Development Studies',
    content: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to IJSDS</h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">International Journal of Social Work and Development Studies</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Dear {{authorName}},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Welcome to the International Journal of Social Work and Development Studies publishing platform! We're excited to have you join our community of researchers, scholars, and practitioners.
          </p>
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
            <ul style="color: #475569; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Complete your profile to enhance your academic presence</li>
              <li style="margin-bottom: 8px;">Review our submission guidelines and editorial policies</li>
              <li style="margin-bottom: 8px;">Explore our published articles and current calls for papers</li>
              <li>Consider joining our reviewer community</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{platformUrl}}/profile" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Complete Your Profile</a>
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
            If you have any questions, please don't hesitate to contact our editorial team. We look forward to your contributions to social work research and development studies.
          </p>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>Editorial Team</strong><br>
              International Journal of Social Work and Development Studies
            </p>
          </div>
        </div>
      </div>
    `,
  },
  author_welcome: {
    subject: 'Welcome to IJSDS - Author Onboarding',
    content: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Author Welcome Guide</h1>
          <p style="color: #a7f3d0; margin: 10px 0 0 0; font-size: 16px;">Your journey to publication starts here</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Dear {{authorName}},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
            Thank you for choosing IJSDS for your research publication. As a first-time author with us, we've prepared this guide to ensure a smooth submission process.
          </p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 18px;">📋 Submission Checklist</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Manuscript follows our formatting guidelines</li>
              <li style="margin-bottom: 8px;">Abstract is between 150-250 words</li>
              <li style="margin-bottom: 8px;">Keywords are relevant and specific (3-5 recommended)</li>
              <li style="margin-bottom: 8px;">References follow APA 7th edition style</li>
              <li>All co-authors have approved the submission</li>
            </ul>
          </div>
          <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">⏱️ Review Timeline</h3>
            <p style="color: #374151; margin: 0; line-height: 1.6;">
              <strong>Initial Review:</strong> 2-3 weeks<br>
              <strong>Peer Review:</strong> 4-6 weeks<br>
              <strong>Final Decision:</strong> 6-8 weeks total
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{platformUrl}}/submission-guidelines" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block; margin-right: 15px;">View Guidelines</a>
            <a href="{{platformUrl}}/submit" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Start Submission</a>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>Editorial Team</strong><br>
              International Journal of Social Work and Development Studies
            </p>
          </div>
        </div>
      </div>
    `,
  },
  submission_received: {
    subject: 'Submission Received - {{title}}',
    content: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Submission Received</h1>
          <p style="color: #ddd6fe; margin: 10px 0 0 0; font-size: 16px;">Your manuscript is now under initial review</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Dear {{authorName}},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
            Thank you for submitting your manuscript to the International Journal of Social Work and Development Studies. We have successfully received your submission and it has been assigned for initial editorial review.
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">📄 Submission Details</h3>
            <table style="width: 100%; color: #374151;">
              <tr><td style="padding: 8px 0; font-weight: 500;">Submission ID:</td><td style="padding: 8px 0;">{{submissionId}}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 500;">Title:</td><td style="padding: 8px 0;">{{title}}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 500;">Submitted:</td><td style="padding: 8px 0;">{{submissionDate}}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 500;">Status:</td><td style="padding: 8px 0;"><span style="background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Under Initial Review</span></td></tr>
            </table>
          </div>
          <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px;">🔄 What Happens Next?</h3>
            <ol style="color: #374151; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Initial editorial review (2-3 weeks)</li>
              <li style="margin-bottom: 8px;">Peer review assignment (if approved)</li>
              <li style="margin-bottom: 8px;">Review completion and editor decision</li>
              <li>Notification of decision with reviewer feedback</li>
            </ol>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{platformUrl}}/dashboard" style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Track Your Submission</a>
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
            You can track the progress of your submission through your author dashboard. We will notify you at each stage of the review process.
          </p>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>Editorial Team</strong><br>
              International Journal of Social Work and Development Studies
            </p>
          </div>
        </div>
      </div>
    `,
  },
  fee_information: {
    subject: 'Publication Fees Information - {{title}}',
    content: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Publication Fees</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Transparent pricing for quality publishing</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Dear {{authorName}},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
            Your manuscript "<strong>{{title}}</strong>" has successfully passed our initial editorial review. We are pleased to move forward with the peer review process.
          </p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #991b1b; margin: 0 0 20px 0; font-size: 18px;">💳 Publication Fee Structure</h3>
            <div style="background-color: white; border-radius: 6px; padding: 20px;">
              <table style="width: 100%; color: #374151;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 500;">Vetting Fee (Initial Review)</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: 600;">₦5,000</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: 500;">Processing Fee (Upon Acceptance)</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: 600;">₦20,000</td>
                </tr>
              </table>
            </div>
          </div>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 18px;">✅ What's Included</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Professional peer review process</li>
              <li style="margin-bottom: 8px;">Editorial oversight and quality assurance</li>
              <li style="margin-bottom: 8px;">Professional copyediting and proofreading</li>
              <li style="margin-bottom: 8px;">DOI assignment and online publication</li>
              <li style="margin-bottom: 8px;">Inclusion in academic databases</li>
              <li>Open access publication with global reach</li>
            </ul>
          </div>
          <div style="background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">📋 Payment Information</h3>
            <p style="color: #374151; margin: 0 0 15px 0; line-height: 1.6;">
              The vetting fee is required to proceed with peer review. Payment instructions will be provided separately through your author dashboard.
            </p>
            <p style="color: #374151; margin: 0; line-height: 1.6;">
              <strong>Note:</strong> The processing fee is only required upon acceptance for publication.
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{platformUrl}}/dashboard" style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">View Payment Details</a>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>Editorial Team</strong><br>
              International Journal of Social Work and Development Studies
            </p>
          </div>
        </div>
      </div>
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
  submission_accepted: {
    subject: 'Submission Accepted for Review - {{title}}',
    content: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Submission Accepted!</h1>
          <p style="color: #a7f3d0; margin: 10px 0 0 0; font-size: 16px;">Your manuscript has been accepted for peer review</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Dear {{authorName}},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
            Congratulations! Your submission "<strong>{{title}}</strong>" has been accepted and is now proceeding to the peer review stage.
          </p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 18px;">✅ Next Steps</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Your manuscript will be assigned to qualified reviewers</li>
              <li style="margin-bottom: 8px;">The peer review process typically takes 4-6 weeks</li>
              <li style="margin-bottom: 8px;">You will receive updates throughout the review process</li>
              <li>You can track progress through your dashboard</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{platformUrl}}/dashboard" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">View Dashboard</a>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>Editorial Team</strong><br>
              International Journal of Social Work and Development Studies
            </p>
          </div>
        </div>
      </div>
    `,
  },
  payment_confirmed: {
    subject: '{{paymentType}} Payment Confirmed - {{articleTitle}}',
    content: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Payment Confirmed</h1>
          <p style="color: #a7f3d0; margin: 10px 0 0 0; font-size: 16px;">Your payment has been successfully processed</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Dear {{userName}},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
            Your {{paymentType}} payment of <strong>₦{{amount}}</strong> for the article "{{articleTitle}}" has been successfully confirmed.
          </p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 18px;">✅ Payment Details</h3>
            <table style="width: 100%; color: #374151;">
              <tr><td style="padding: 8px 0; font-weight: 500;">Payment Type:</td><td style="padding: 8px 0;">{{paymentType}}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 500;">Amount:</td><td style="padding: 8px 0;">₦{{amount}}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 500;">Article:</td><td style="padding: 8px 0;">{{articleTitle}}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 500;">Status:</td><td style="padding: 8px 0;"><span style="background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Confirmed</span></td></tr>
            </table>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{platformUrl}}/dashboard" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">View Dashboard</a>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>Editorial Team</strong><br>
              International Journal of Social Work and Development Studies
            </p>
          </div>
        </div>
      </div>
    `,
  },
  payment_received_editor: {
    subject: 'Payment Received - {{paymentType}} for {{articleTitle}}',
    content: `
      <h2>Payment Received Notification</h2>
      <p>Dear {{editorName}},</p>
      <p>A payment has been received for the following article:</p>
      <ul>
        <li><strong>Article:</strong> {{articleTitle}}</li>
        <li><strong>Author:</strong> {{userName}}</li>
        <li><strong>Payment Type:</strong> {{paymentType}}</li>
        <li><strong>Amount:</strong> ₦{{amount}}</li>
      </ul>
      <p>The payment has been confirmed and the article can proceed in the review process.</p>
      <p>Best regards,<br>Editorial System</p>
    `,
  },
  payment_pending_editor: {
    subject: 'Payment Pending - {{paymentType}} for {{articleTitle}}',
    content: `
      <h2>Payment Pending Notification</h2>
      <p>Dear {{editorName}},</p>
      <p>The following payment is still pending:</p>
      <ul>
        <li><strong>Article:</strong> {{articleTitle}}</li>
        <li><strong>Author:</strong> {{userName}} ({{userEmail}})</li>
        <li><strong>Payment Type:</strong> {{paymentType}}</li>
        <li><strong>Status:</strong> Pending</li>
      </ul>
      <p>Please follow up with the author if necessary.</p>
      <p>Best regards,<br>Editorial System</p>
    `,
  },
  SendReciept: {
    subject: 'Receipt for {{type}}',
    content: `
      <h2>Confirmation Receipt</h2>
      <p>Dear {{authorName}}, your payment as been received, find your receipt attached to this mail</p>
      <p>Here's your receipt</p>
          {{receiptLink}}
      <p>Best regards,<br>Editorial System</p>
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