import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Subscribe to notifications for the current user
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new;
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
            variant: notification.type === 'error' ? 'destructive' : 'default',
            duration: 5000,
          });

          // Play notification sound
          playNotificationSound();

          // Update browser title to show new notification
          updatePageTitle(true);
        }
      )
      .subscribe();

    // Subscribe to discussion messages
    const discussionChannel = supabase
      .channel('discussion-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'discussion_messages',
        },
        (payload) => {
          // Only show if user is involved in the discussion
          checkDiscussionInvolvement(payload.new.thread_id).then((isInvolved) => {
            if (isInvolved) {
              toast({
                title: "New Discussion Message",
                description: "Someone replied in a discussion thread",
                duration: 4000,
              });
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(discussionChannel);
      resetPageTitle();
    };
  }, [user, toast]);

  const checkDiscussionInvolvement = async (threadId: string) => {
    if (!user) return false;

    try {
      const { data: thread } = await supabase
        .from('discussion_threads')
        .select(`
          *,
          submission:submissions(submitter_id)
        `)
        .eq('id', threadId)
        .single();

      if (!thread) return false;

      // Check if user is the submission author or has editor/reviewer role
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_editor, is_reviewer')
        .eq('id', user.id)
        .single();

      const isAuthor = thread.submission?.submitter_id === user.id;
      const isEditorOrReviewer = profile?.is_editor || profile?.is_reviewer;

      return isAuthor || isEditorOrReviewer;
    } catch (error) {
      console.error('Error checking discussion involvement:', error);
      return false;
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Ignore audio errors (user might not have interacted with page yet)
      console.debug('Could not play notification sound:', error);
    }
  };

  const updatePageTitle = (hasNewNotification: boolean) => {
    const originalTitle = 'IJSDS - International Journal of Social Work and Development Studies';
    if (hasNewNotification) {
      document.title = '🔔 ' + originalTitle;
    }
  };

  const resetPageTitle = () => {
    document.title = 'IJSDS - International Journal of Social Work and Development Studies';
  };

  // Reset title when user focuses on the page
  useEffect(() => {
    const handleFocus = () => resetPageTitle();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
};