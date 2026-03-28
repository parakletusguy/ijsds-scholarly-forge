import { sendNotification } from './notificationApiService';
import { getProfiles } from './profileService';

// ---------------------------------------------------------------------------
// Low-level send helper — wraps POST /api/notifications/send
// ---------------------------------------------------------------------------
export const sendEmailNotification = async (data: {
  to: string;
  subject: string;
  htmlContent: string;
  type?: string;
  userId?: string;
  submissionId?: string;
}) => {
  try {
    await sendNotification({
      template: data.type || 'user_welcome',
      to: data.to,
      recipient_id: data.userId || '',
      submission_id: data.submissionId,
      data: {
        subject: data.subject,
        htmlContent: data.htmlContent,
      },
      in_app: !!data.userId,
      in_app_title: data.subject,
      in_app_message: data.htmlContent.replace(/<[^>]*>/g, '').substring(0, 200),
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send email notification:', error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Welcome emails
// ---------------------------------------------------------------------------
export const sendWelcomeEmail = async (userId: string, authorName: string, email: string) => {
  try {
    await sendNotification({
      template: 'user_welcome',
      to: email,
      recipient_id: userId,
      data: { authorName, platformUrl: window.location.origin },
      in_app: true,
      in_app_title: 'Welcome to IJSDS',
      in_app_message: 'Welcome to the International Journal of Social Work and Development Studies platform!',
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

export const sendAuthorWelcomeEmail = async (userId: string, authorName: string, email: string) => {
  try {
    await sendNotification({
      template: 'author_welcome',
      to: email,
      recipient_id: userId,
      data: { authorName, platformUrl: window.location.origin },
      in_app: true,
      in_app_title: 'Welcome to IJSDS',
      in_app_message: 'Your complete guide to publishing with IJSDS',
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send author welcome email:', error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Submission notifications
// ---------------------------------------------------------------------------
export const sendFeeInformationEmail = async (userId: string, authorName: string, title: string) => {
  try {
    await sendNotification({
      template: 'fee_information',
      to: '',
      recipient_id: userId,
      data: { authorName, title, platformUrl: window.location.origin },
      in_app: true,
      in_app_title: 'Publication Fees Information',
      in_app_message: 'Information about publication fees for your submission',
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send fee information email:', error);
    throw error;
  }
};

export const SendRecieptMail = async (
  userId: string,
  authorName: string,
  title: string,
  receiptLink: string,
  type: string,
) => {
  try {
    await sendNotification({
      template: 'send_receipt',
      to: '',
      recipient_id: userId,
      data: { authorName, title, platformUrl: window.location.origin, receiptLink, type },
      in_app: true,
      in_app_title: 'Receipt',
      in_app_message: 'Information about publication fees for your submission',
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send receipt email:', error);
    throw error;
  }
};

export const notifyUserSubmissionReceived = async (userId: string, authorName: string, submissionTitle: string) => {
  try {
    await sendNotification({
      template: 'submission_received',
      to: '',
      recipient_id: userId,
      data: { authorName, submissionTitle, platformUrl: window.location.origin },
      in_app: true,
      in_app_title: 'Submission Received',
      in_app_message: `Your article "${submissionTitle}" has been successfully submitted for review.`,
    });
  } catch (error) {
    console.error('Error notifying user of submission:', error);
  }
};

export const notifyUserApprovalForProcessing = async (userId: string, authorName: string, submissionTitle: string) => {
  try {
    await sendNotification({
      template: 'decision_made',
      to: '',
      recipient_id: userId,
      data: { authorName, submissionTitle, platformUrl: window.location.origin },
      in_app: true,
      in_app_title: 'Article Approved for Processing',
      in_app_message: `Your article "${submissionTitle}" has been approved and is moving to production.`,
    });
  } catch (error) {
    console.error('Error notifying user of approval:', error);
  }
};

export const notifyUserArticlePublished = async (userId: string, authorName: string, submissionTitle: string) => {
  try {
    await sendNotification({
      template: 'article_published',
      to: '',
      recipient_id: userId,
      data: { authorName, submissionTitle, platformUrl: window.location.origin },
      in_app: true,
      in_app_title: 'Article Published!',
      in_app_message: `Congratulations! Your article "${submissionTitle}" has been published.`,
    });
  } catch (error) {
    console.error('Error notifying user of publication:', error);
  }
};

// ---------------------------------------------------------------------------
// Admin notifications
// ---------------------------------------------------------------------------
export const notifyAdmins = async (title: string, message: string) => {
  try {
    const admins = await getProfiles({ role: 'admin' });
    for (const admin of admins) {
      await sendNotification({
        template: 'user_welcome',
        to: admin.email,
        recipient_id: admin.id,
        data: { title, message },
        in_app: true,
        in_app_title: title,
        in_app_message: message,
      });
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
};

export const notifyAdminsSubmission = async (submissionTitle: string, authorName: string) =>
  notifyAdmins('New Article Submission', `A new article "${submissionTitle}" has been submitted by ${authorName}.`);

export const notifyAdminsRevisionComplete = async (submissionTitle: string, authorName: string) =>
  notifyAdmins('Revision Submitted', `${authorName} has submitted a revised version of "${submissionTitle}".`);

export const notifyAdminsAcceptance = async (submissionTitle: string, authorName: string) =>
  notifyAdmins('Article Accepted', `The article "${submissionTitle}" by ${authorName} has been accepted.`);

export const notifyAdminsNewSubmission = async (
  submissionTitle: string,
  authorName: string,
  authorEmail: string,
  totalSubmissions: number,
) =>
  notifyAdmins(
    'New Article Submission - Action Required',
    `Title: "${submissionTitle}" | Author: ${authorName} (${authorEmail}) | Total submissions: ${totalSubmissions}`,
  );

// ---------------------------------------------------------------------------
// Email body generators (kept as-is — used by dialog components)
// ---------------------------------------------------------------------------
export const generateReviewInvitationEmail = (reviewerName: string, submissionTitle: string, deadline: string) => `
<html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
<h2>Review Invitation</h2>
<p>Dear ${reviewerName},</p>
<p>You have been invited to review a manuscript submission:</p>
<div style="background:#f5f5f5;padding:15px;margin:15px 0;border-left:4px solid #007cba"><strong>Title:</strong> ${submissionTitle}</div>
<p><strong>Review Deadline:</strong> ${deadline}</p>
<p>Please log in to accept or decline this invitation.</p>
<a href="https://ijsds.org/auth">Login</a>
<p>Best regards,<br>Editorial Team</p>
</body></html>`;

export const generateStatusChangeEmail = (authorName: string, submissionTitle: string, newStatus: string, message?: string) => {
  const statusMessages: Record<string, string> = {
    under_review: 'Your submission is now under peer review.',
    revision_requested: 'Revisions have been requested for your submission.',
    accepted: 'Congratulations! Your submission has been accepted for publication.',
    rejected: 'We regret to inform you that your submission has been declined.',
  };
  return `
<html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
<h2>Submission Status Update</h2>
<p>Dear ${authorName},</p>
<div style="background:#f5f5f5;padding:15px;margin:15px 0;border-left:4px solid #007cba">
<strong>Title:</strong> ${submissionTitle}<br>
<strong>New Status:</strong> ${newStatus.replace('_', ' ').toUpperCase()}
</div>
<p>${statusMessages[newStatus] || 'Your submission status has been updated.'}</p>
${message ? `<div style="background:#fff3cd;padding:15px;margin:15px 0;border-left:4px solid #ffc107"><strong>Additional Info:</strong><br>${message}</div>` : ''}
<p>Best regards,<br>Editorial Team</p>
</body></html>`;
};

export const generateDeadlineReminderEmail = (reviewerName: string, submissionTitle: string, deadline: string, daysRemaining: number) => `
<html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
<h2>Review Deadline Reminder</h2>
<p>Dear ${reviewerName},</p>
<div style="background:#fff3cd;padding:15px;margin:15px 0;border-left:4px solid #ffc107">
<strong>Title:</strong> ${submissionTitle}<br>
<strong>Deadline:</strong> ${deadline}<br>
<strong>Days Remaining:</strong> ${daysRemaining}
</div>
<p>Please complete your review as soon as possible.</p>
<p>Best regards,<br>Editorial Team</p>
</body></html>`;
