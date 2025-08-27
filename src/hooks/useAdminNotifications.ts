import { useCallback } from 'react';
import { notifyAdminsSubmission, notifyAdminsRevisionComplete, notifyAdminsAcceptance } from '@/lib/emailService';

export const useAdminNotifications = () => {
  const notifySubmission = useCallback(async (submissionTitle: string, authorName: string) => {
    try {
      await notifyAdminsSubmission(submissionTitle, authorName);
    } catch (error) {
      console.error('Error notifying admins of submission:', error);
    }
  }, []);

  const notifyRevisionComplete = useCallback(async (submissionTitle: string, authorName: string) => {
    try {
      await notifyAdminsRevisionComplete(submissionTitle, authorName);
    } catch (error) {
      console.error('Error notifying admins of revision completion:', error);
    }
  }, []);

  const notifyAcceptance = useCallback(async (submissionTitle: string, authorName: string) => {
    try {
      await notifyAdminsAcceptance(submissionTitle, authorName);
    } catch (error) {
      console.error('Error notifying admins of acceptance:', error);
    }
  }, []);

  return {
    notifySubmission,
    notifyRevisionComplete,
    notifyAcceptance,
  };
};