import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface RejectionMessage {
  id: string;
  message: string;
  suggested_corrections: string | null;
  created_at: string;
}

interface RejectionMessagesProps {
  submissionId: string;
}

export const RejectionMessages = ({ submissionId }: RejectionMessagesProps) => {
  const [messages, setMessages] = useState<RejectionMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRejectionMessages();
  }, [submissionId]);

  const fetchRejectionMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('rejection_messages')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rejection messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-destructive" />
        Editorial Feedback
      </h3>
      
      {messages.map((message) => (
        <Card key={message.id} className="border-destructive/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-destructive">Editorial Decision</CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Feedback:</h4>
              <p className="text-sm text-muted-foreground">{message.message}</p>
            </div>
            
            {message.suggested_corrections && (
              <div>
                <h4 className="font-medium text-sm mb-2">Suggested Corrections:</h4>
                <p className="text-sm text-muted-foreground">{message.suggested_corrections}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};