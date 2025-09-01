import { notifyAdmins, sendEmailNotification } from '@/lib/emailService';
import { supabase } from '@/integrations/supabase/client';

export type RoleType = 'editor' | 'reviewer';

export const notifyAdminsOfRoleRequest = async (params: {
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  role: RoleType;
}) => {
  const { requesterId, requesterName, requesterEmail, role } = params;
  const title = role === 'editor' ? 'New Editor Role Request' : 'New Reviewer Role Request';
  const message = `A user has requested ${role} privileges.<br/><br/>
  <strong>Name:</strong> ${requesterName || 'N/A'}<br/>
  <strong>Email:</strong> ${requesterEmail || 'N/A'}<br/>
  <strong>User ID:</strong> ${requesterId}`;

  await notifyAdmins(title, message, 'info');
};

export const notifyRequesterOfRoleDecision = async (params: {
  userId: string;
  email: string;
  name: string;
  role: RoleType;
  decision: 'accepted' | 'rejected';
}) => {
  const { userId, email, name, role, decision } = params;
  const roleLabel = role === 'editor' ? 'Editor' : 'Reviewer';
  const subject = decision === 'accepted'
    ? `Your ${roleLabel} request has been approved`
    : `Your ${roleLabel} request has been declined`;

  const htmlContent = `
    <h2>${subject}</h2>
    <p>Dear ${name || 'User'},</p>
    <p>Your request to become a <strong>${roleLabel}</strong> has been <strong>${decision}</strong>.</p>
    ${decision === 'accepted'
      ? '<p>You now have access to the additional features associated with this role.</p>'
      : '<p>You may update your profile and try again later if applicable.</p>'}
    <p>Best regards,<br/>IJSDS Team</p>
  `;

  await sendEmailNotification({
    to: email,
    subject,
    htmlContent,
    userId,
    type: 'role_request'
  });
};
