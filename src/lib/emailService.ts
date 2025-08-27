
import { supabase } from '@/integrations/supabase/client';

export interface EmailNotificationData {
  to: string;
  subject: string;
  htmlContent: string;
  type?: string;
  userId?: string;
  submissionId?: string;
  reviewId?: string;
}

export const sendEmailNotification = async (data: EmailNotificationData) => {
  try {
    const { error } = await supabase.functions.invoke('send-email-notification', {
      body: data
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    // If userId is provided, also create an in-app notification
    if (data.userId) {
      await supabase.from('notifications').insert({
        user_id: data.userId,
        title: data.subject,
        message: data.htmlContent ? data.htmlContent.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 'You have a new email notification',
        type: 'info'
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send email notification:', error);
    throw error;
  }
};

// Welcome email for new users
export const sendWelcomeEmail = async (userId: string, authorName: string, email: string) => {
  try {
    const { error } = await supabase.functions.invoke('notification-service', {
      body: {
        userId,
        title: 'Welcome to IJSDS',
        message: 'Welcome to the International Journal of Social Work and Development Studies platform!',
        type: 'info',
        emailNotification: true,
        emailTemplate: 'user_welcome',
        emailData: {
          authorName,
          platformUrl: window.location.origin
        }
      }
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

// Author-specific welcome email
export const sendAuthorWelcomeEmail = async (userId: string, authorName: string, email: string) => {
  try {
    const { error } = await supabase.functions.invoke('notification-service', {
      body: {
        userId,
        title: 'Welcome to IJSDS - Author Guide',
        message: 'Your complete guide to publishing with IJSDS',
        type: 'info',
        emailNotification: true,
        emailTemplate: 'author_welcome',
        emailData: {
          authorName,
          platformUrl: window.location.origin
        }
      }
    });

    if (error) {
      console.error('Error sending author welcome email:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send author welcome email:', error);
    throw error;
  }
};

// Fee information email
export const sendFeeInformationEmail = async (userId: string, authorName: string, title: string) => {
  try {
    const { error } = await supabase.functions.invoke('notification-service', {
      body: {
        userId,
        title: 'Publication Fees Information',
        message: 'Information about publication fees for your submission',
        type: 'info',
        emailNotification: true,
        emailTemplate: 'fee_information',
        emailData: {
          authorName,
          title,
          platformUrl: window.location.origin
        }
      }
    });

    if (error) {
      console.error('Error sending fee information email:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send fee information email:', error);
    throw error;
  }
};

export const generateReviewInvitationEmail = (reviewerName: string, submissionTitle: string, deadline: string) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Review Invitation</h2>
        <p>Dear ${reviewerName},</p>
        
        <p>You have been invited to review a manuscript submission:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #007cba;">
          <strong>Title:</strong> ${submissionTitle}
        </div>
        
        <p><strong>Review Deadline:</strong> ${deadline}</p>
        
        <p>Please log into the system to accept or decline this review invitation and access the manuscript.</p>
        <a href='https://ijsds.org/auth/:signin' >Login</a>
        
        <p>Thank you for your contribution to the peer review process.</p>
        
        <p>Best regards,<br>
        Editorial Team</p>
      </body>
    </html>
  `;
};

export const generateStatusChangeEmail = (authorName: string, submissionTitle: string, newStatus: string, message?: string) => {
  const statusMessages = {
    'under_review': 'Your submission is now under peer review.',
    'revision_requested': 'Revisions have been requested for your submission.',
    'accepted': 'Congratulations! Your submission has been accepted for publication.',
    'rejected': 'We regret to inform you that your submission has been declined.',
  };

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Submission Status Update</h2>
        <p>Dear ${authorName},</p>
        
        <p>The status of your manuscript submission has been updated:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #007cba;">
          <strong>Title:</strong> ${submissionTitle}<br>
          <strong>New Status:</strong> ${newStatus.replace('_', ' ').toUpperCase()}
        </div>
        
        <p>${statusMessages[newStatus as keyof typeof statusMessages] || 'Your submission status has been updated.'}</p>
        
        ${message ? `<div style="background-color: #fff3cd; padding: 15px; margin: 15px 0; border-left: 4px solid #ffc107;">
          <strong>Additional Information:</strong><br>
          ${message}
        </div>` : ''}
        
        <p>You can view the full details by logging into your account.</p>
        
        <p>Best regards,<br>
        Editorial Team</p>
      </body>
    </html>
  `;
};

export const generateDeadlineReminderEmail = (reviewerName: string, submissionTitle: string, deadline: string, daysRemaining: number) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Review Deadline Reminder</h2>
        <p>Dear ${reviewerName},</p>
        
        <p>This is a reminder that you have a pending review with an upcoming deadline:</p>
        
        <div style="background-color: #fff3cd; padding: 15px; margin: 15px 0; border-left: 4px solid #ffc107;">
          <strong>Title:</strong> ${submissionTitle}<br>
          <strong>Deadline:</strong> ${deadline}<br>
          <strong>Days Remaining:</strong> ${daysRemaining}
        </div>
        
        <p>Please complete your review as soon as possible. If you need an extension, please contact the editorial team immediately.</p>
        
        <p>Thank you for your contribution to the peer review process.</p>
        
        <p>Best regards,<br>
        Editorial Team</p>
      </body>
    </html>
  `;
};
