import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, User } from 'lucide-react';
import { format } from 'date-fns';

interface DiscussionMessage {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  author?: {
    full_name: string;
    email: string;
  };
}

interface DiscussionThread {
  id: string;
  title: string;
  submission_id: string;
  created_by: string;
  created_at: string;
  messages?: DiscussionMessage[];
}

interface DiscussionThreadProps {
  submissionId: string;
  userRole?: 'author' | 'editor' | 'reviewer';
}

export const DiscussionThread = ({ submissionId, userRole = 'author' }: DiscussionThreadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<DiscussionThread | null>(null);
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchDiscussionThreads();
  }, [submissionId]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
    }
  }, [selectedThread]);

  const fetchDiscussionThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('discussion_threads')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setThreads(data || []);
    } catch (error) {
      console.error('Error fetching discussion threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const { data, error } = await supabase
        .from('discussion_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createNewThread = async () => {
    if (!newThreadTitle.trim() || !user) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('discussion_threads')
        .insert({
          title: newThreadTitle,
          submission_id: submissionId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discussion thread created successfully",
      });

      setNewThreadTitle('');
      setShowNewThread(false);
      fetchDiscussionThreads();
      setSelectedThread(data);
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: "Error",
        description: "Failed to create discussion thread",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('discussion_messages')
        .insert({
          thread_id: selectedThread.id,
          content: newMessage,
          author_id: user.id,
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedThread.id);

      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Discussion
        </h3>
        {userRole === 'editor' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewThread(!showNewThread)}
          >
            New Thread
          </Button>
        )}
      </div>

      {showNewThread && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Discussion Thread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Thread title..."
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <Button onClick={createNewThread} disabled={sending || !newThreadTitle.trim()}>
                  Create Thread
                </Button>
                <Button variant="outline" onClick={() => setShowNewThread(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Discussion Threads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {threads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No discussion threads yet
                </p>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedThread?.id === thread.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedThread(thread)}
                  >
                    <h4 className="font-medium text-sm line-clamp-2">
                      {thread.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(thread.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedThread ? selectedThread.title : 'Select a thread'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedThread ? (
              <div className="space-y-4">
                {/* Messages List */}
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No messages in this thread yet
                    </p>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              Unknown User
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select a discussion thread to view messages
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};