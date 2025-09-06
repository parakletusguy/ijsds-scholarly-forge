import { supabase } from '@/integrations/supabase/client';

export const notifyPaymentConfirmation = async (
  userId: string,
  userEmail: string,
  userName: string,
  articleTitle: string,
  paymentType: 'vetting_fee' | 'processing_fee',
  amount: number
) => {
  try {
    const paymentLabel = paymentType === 'vetting_fee' ? 'Vetting Fee' : 'Processing Fee';
    
    // Send notification to user
    await supabase.functions.invoke('notification-service', {
      body: {
        userId,
        title: `${paymentLabel} Payment Confirmed`,
        message: `Your ${paymentLabel.toLowerCase()} payment of ₦${amount.toLocaleString()} for "${articleTitle}" has been confirmed.`,
        type: 'success',
        emailNotification: true,
        emailTemplate: 'payment_confirmed',
        emailData: {
          userName,
          articleTitle,
          paymentType: paymentLabel,
          amount: amount.toLocaleString()
        }
      }
    });

    // Notify editors about payment
    const { data: editors } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('is_editor', true);

    if (editors) {
      for (const editor of editors) {
        await supabase.functions.invoke('notification-service', {
          body: {
            userId: editor.id,
            title: `Payment Received - ${paymentLabel}`,
            message: `${userName} has paid the ${paymentLabel.toLowerCase()} (₦${amount.toLocaleString()}) for article "${articleTitle}".`,
            type: 'info',
            emailNotification: true,
            emailTemplate: 'payment_received_editor',
            emailData: {
              editorName: editor.full_name,
              userName,
              articleTitle,
              paymentType: paymentLabel,
              amount: amount.toLocaleString()
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error sending payment confirmation notifications:', error);
  }
};

export const notifyPaymentPending = async (
  articleTitle: string,
  userName: string,
  userEmail: string,
  paymentType: 'vetting_fee' | 'processing_fee'
) => {
  try {
    const paymentLabel = paymentType === 'vetting_fee' ? 'Vetting Fee' : 'Processing Fee';
    
    // Notify editors about pending payment
    const { data: editors } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('is_editor', true);

    if (editors) {
      for (const editor of editors) {
        await supabase.functions.invoke('notification-service', {
          body: {
            userId: editor.id,
            title: `Payment Pending - ${paymentLabel}`,
            message: `The ${paymentLabel.toLowerCase()} for article "${articleTitle}" by ${userName} (${userEmail}) is still pending.`,
            type: 'warning',
            emailNotification: true,
            emailTemplate: 'payment_pending_editor',
            emailData: {
              editorName: editor.full_name,
              userName,
              userEmail,
              articleTitle,
              paymentType: paymentLabel
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error sending payment pending notifications:', error);
  }
};

export const notifySubmissionAcceptance = async (
  userId: string,
  userName: string,
  userEmail: string,
  articleTitle: string
) => {
  try {
    // Send notification to author
    await supabase.functions.invoke('notification-service', {
      body: {
        userId,
        title: 'Submission Accepted for Review',
        message: `Great news! Your submission "${articleTitle}" has been accepted for peer review.`,
        type: 'success',
        emailNotification: true,
        emailTemplate: 'submission_accepted',
        emailData: {
          authorName: userName,
          title: articleTitle
        }
      }
    });
  } catch (error) {
    console.error('Error sending submission acceptance notification:', error);
  }
};