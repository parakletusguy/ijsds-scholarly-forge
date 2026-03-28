import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { api, getToken } from '@/lib/apiClient';

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const token = getToken();
    if (!token) return;

    // Use SSE for real-time notifications — pass token as query param
    // because EventSource does not support custom headers in all browsers
    const url = `${api.baseUrl}/api/notifications/stream?token=${encodeURIComponent(token)}`;
    const evtSource = new EventSource(url);

    evtSource.addEventListener('notification', (e: MessageEvent) => {
      try {
        const notification = JSON.parse(e.data);
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'error' ? 'destructive' : 'default',
          duration: 5000,
        });
        playNotificationSound();
        updatePageTitle(true);
      } catch {
        // ignore malformed events
      }
    });

    evtSource.addEventListener('heartbeat', () => {
      // keep-alive — no action needed
    });

    evtSource.onerror = () => {
      evtSource.close();
    };

    return () => {
      evtSource.close();
      resetPageTitle();
    };
  }, [user, toast]);

  // Reset title on window focus
  useEffect(() => {
    const handleFocus = () => resetPageTitle();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
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
  } catch {
    // ignore audio errors
  }
};

const updatePageTitle = (hasNew: boolean) => {
  const base = 'IJSDS - International Journal of Social Work and Development Studies';
  document.title = hasNew ? '🔔 ' + base : base;
};

const resetPageTitle = () => {
  document.title = 'IJSDS - International Journal of Social Work and Development Studies';
};
