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

/**
 * Notifies an author that their article has been published.
 * Per Q2 decision: automatically fires the post-publication indexing email
 * so authors receive their indexing instructions without a manual trigger.
 *
 * Source: IJSDS Master Implementation Guide §4.1 — Post-Publication Email
 *
 * @param userId       - Supabase user ID of the author
 * @param authorName   - Full name for personalisation
 * @param authorEmail  - Email address to send the indexing instructions to
 * @param submissionTitle - Article title
 * @param doi          - Zenodo DOI (e.g. "10.5281/zenodo.XXXXX")
 * @param articleUrl   - Canonical public URL (e.g. "https://ijsds.org/article/uuid")
 */
export const notifyUserArticlePublished = async (
  userId: string,
  authorName: string,
  submissionTitle: string,
  authorEmail?: string,
  doi?: string | null,
  articleUrl?: string,
) => {
  try {
    // In-app notification (existing behaviour preserved)
    await sendNotification({
      template: 'article_published',
      to: '',
      recipient_id: userId,
      data: { authorName, submissionTitle, platformUrl: window.location.origin },
      in_app: true,
      in_app_title: 'Article Published!',
      in_app_message: `Congratulations! Your article "${submissionTitle}" has been published.`,
    });

    // Q2 decision: automatically fire post-publication indexing email
    if (authorEmail) {
      await sendPostPublicationIndexingEmail({
        authorEmail,
        authorName,
        articleTitle: submissionTitle,
        doi: doi ?? null,
        articleUrl: articleUrl ?? window.location.origin,
      });
    }
  } catch (error) {
    console.error('Error notifying user of publication:', error);
  }
};

// ---------------------------------------------------------------------------
// §4.1 — Post-Publication Indexing Email
// Source: IJSDS Master Implementation Guide §4.1 — Author Communication Template
//
// Sent automatically when an article is published. Provides the author with
// their direct links, metadata file instructions, and three-step indexing guide.
// ---------------------------------------------------------------------------

export interface PostPublicationEmailParams {
  authorEmail: string;
  authorName: string;
  articleTitle: string;
  doi: string | null;
  articleUrl: string;
}

/**
 * Generates the HTML body for the post-publication indexing email.
 * Matches the exact template from IJSDS_Indexing_Implementation_Plan.md §4.1.
 */
export const generatePostPublicationIndexingEmailHtml = (params: PostPublicationEmailParams): string => {
  const { authorName, articleTitle, doi, articleUrl } = params;
  const doiLine = doi
    ? `<strong>DOI:</strong> <a href="https://doi.org/${doi}" style="color:#007cba">${doi}</a>`
    : `<strong>DOI:</strong> (will be assigned via Zenodo — check your dashboard)`;

  return `
<html>
<body style="font-family:Arial,sans-serif;line-height:1.7;color:#333;max-width:640px;margin:0 auto;padding:24px">

  <div style="background:#0a4d8c;padding:20px 24px;border-radius:8px 8px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">
      International Journal of Social Work and Development Studies (IJSDS)
    </h2>
  </div>

  <div style="border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 8px 8px">

    <p>Dear ${authorName},</p>

    <p>
      Congratulations! Your article, <strong>"${articleTitle}"</strong>, is now officially published
      in the <strong>International Journal of Social Work and Development Studies (IJSDS)</strong>.
    </p>

    <div style="background:#f0f7ff;border-left:4px solid #0a4d8c;padding:14px 18px;margin:18px 0;border-radius:0 4px 4px 0">
      <p style="margin:0 0 6px 0">${doiLine}</p>
      <p style="margin:0">
        <strong>Article URL:</strong>
        <a href="${articleUrl}" style="color:#007cba">${articleUrl}</a>
      </p>
    </div>

    <p>
      To maximise the reach and citation impact of your work, please follow these
      <strong>three steps</strong> to index your paper on major academic platforms:
    </p>

    <ol style="padding-left:20px">
      <li style="margin-bottom:12px">
        <strong>Add to ORCID (Automatic):</strong> If you have linked your ORCID to your
        Zenodo account, your paper will appear automatically. If not, you can manually
        add it using your DOI: <em>${doi ?? 'see your article page'}</em>.<br/>
        <a href="https://ijsds.org/orcidGuide" style="color:#007cba">
          → Step-by-step ORCID guide
        </a>
      </li>
      <li style="margin-bottom:12px">
        <strong>Upload to ResearchGate &amp; Academia.edu:</strong> Use the
        <strong>BibTeX file</strong> available on your article page to "Bulk Upload"
        your metadata. This ensures all citation data is 100% accurate.
      </li>
      <li style="margin-bottom:12px">
        <strong>Share the Link:</strong> Please use the official article URL
        (<a href="${articleUrl}" style="color:#007cba">${articleUrl}</a>) when sharing
        your work on social media to ensure all traffic is tracked correctly.
      </li>
    </ol>

    <p>
      Download your official metadata (BibTeX) here:
      <a href="${articleUrl}" style="color:#007cba">
        ${articleUrl} &rarr; "Export Citation (BibTeX)" button
      </a>
    </p>

    <p>
      For full platform-by-platform instructions, visit our
      <a href="https://ijsds.org/indexing" style="color:#007cba">
        Author Indexing Guide
      </a>.
    </p>

    <p>Thank you for contributing to IJSDS.</p>

    <p>
      Best regards,<br/>
      <strong>The IJSDS Editorial Team</strong><br/>
      <a href="https://ijsds.org" style="color:#007cba">ijsds.org</a>
    </p>

  </div>
</body>
</html>`;
};

/**
 * Sends the post-publication indexing email to the author.
 * Source: IJSDS Master Implementation Guide §4.1
 */
export const sendPostPublicationIndexingEmail = async (params: PostPublicationEmailParams): Promise<void> => {
  const { authorEmail, articleTitle, doi } = params;

  try {
    const subject = `Action Required: Index your new IJSDS publication${doi ? ` (DOI: ${doi})` : ''}`;
    const htmlContent = generatePostPublicationIndexingEmailHtml(params);

    await sendEmailNotification({
      to: authorEmail,
      subject,
      htmlContent,
      type: 'article_published',
    });
  } catch (error) {
    console.error('Failed to send post-publication indexing email:', error);
    // Non-fatal: log and continue — do not block the publish workflow
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
