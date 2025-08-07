import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    socket.close(1008, "User ID required");
    return response;
  }

  console.log(`WebSocket connection established for user: ${userId}`);

  // Set up real-time subscriptions for the user
  const notificationChannel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('New notification for user:', userId, payload);
        socket.send(JSON.stringify({
          type: 'notification',
          data: payload.new,
        }));
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'discussion_messages',
      },
      async (payload) => {
        // Check if user is involved in this discussion
        const { data: thread } = await supabase
          .from('discussion_threads')
          .select(`
            *,
            submissions!inner(submitter_id)
          `)
          .eq('id', payload.new.thread_id)
          .single();

        if (thread) {
          const isInvolved = thread.submissions.submitter_id === userId || 
                           thread.created_by === userId;
          
          if (isInvolved && payload.new.author_id !== userId) {
            socket.send(JSON.stringify({
              type: 'discussion_message',
              data: payload.new,
              thread: thread,
            }));
          }
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'submissions',
      },
      async (payload) => {
        // Notify submitter of status changes
        if (payload.new.submitter_id === userId && 
            payload.old.status !== payload.new.status) {
          socket.send(JSON.stringify({
            type: 'submission_status_change',
            data: {
              submission_id: payload.new.id,
              old_status: payload.old.status,
              new_status: payload.new.status,
            }
          }));
        }
      }
    )
    .subscribe();

  socket.onopen = () => {
    console.log(`WebSocket opened for user: ${userId}`);
    socket.send(JSON.stringify({ type: 'connected', userId }));
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);

      switch (message.type) {
        case 'ping':
          socket.send(JSON.stringify({ type: 'pong' }));
          break;
        
        case 'mark_notification_read':
          if (message.notificationId) {
            await supabase
              .from('notifications')
              .update({ read: true })
              .eq('id', message.notificationId)
              .eq('user_id', userId);
          }
          break;

        case 'join_discussion':
          if (message.threadId) {
            // Subscribe to specific discussion thread updates
            const discussionChannel = supabase
              .channel(`discussion:${message.threadId}`)
              .on(
                'postgres_changes',
                {
                  event: 'INSERT',
                  schema: 'public',
                  table: 'discussion_messages',
                  filter: `thread_id=eq.${message.threadId}`,
                },
                (payload) => {
                  socket.send(JSON.stringify({
                    type: 'new_discussion_message',
                    data: payload.new,
                  }));
                }
              )
              .subscribe();
          }
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  socket.onclose = () => {
    console.log(`WebSocket closed for user: ${userId}`);
    supabase.removeChannel(notificationChannel);
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for user ${userId}:`, error);
  };

  return response;
});