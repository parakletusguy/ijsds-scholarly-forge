-- Create messages table for internal communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL, 
  submission_id UUID REFERENCES public.submissions(id),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages they sent or received" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update message read status" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = recipient_id);

-- Create discussion_threads table for submission discussions
CREATE TABLE public.discussion_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.submissions(id),
  title TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on discussion_threads table
ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;

-- Create discussion_messages table for thread messages
CREATE TABLE public.discussion_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on discussion_messages table
ALTER TABLE public.discussion_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for discussion threads and messages
CREATE POLICY "Users can view discussions for submissions they have access to" 
ON public.discussion_threads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM submissions s 
    WHERE s.id = discussion_threads.submission_id 
    AND (s.submitter_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND (p.is_editor = true OR p.is_reviewer = true)
    ))
  )
);

CREATE POLICY "Editors can create discussion threads" 
ON public.discussion_threads 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND is_editor = true
));

CREATE POLICY "Users can view discussion messages for accessible threads" 
ON public.discussion_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM discussion_threads dt
    JOIN submissions s ON s.id = dt.submission_id
    WHERE dt.id = discussion_messages.thread_id 
    AND (s.submitter_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND (p.is_editor = true OR p.is_reviewer = true)
    ))
  )
);

CREATE POLICY "Users can add messages to accessible threads" 
ON public.discussion_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM discussion_threads dt
    JOIN submissions s ON s.id = dt.submission_id
    WHERE dt.id = discussion_messages.thread_id 
    AND (s.submitter_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND (p.is_editor = true OR p.is_reviewer = true)
    ))
  )
);

-- Create trigger for discussion_threads updated_at
CREATE TRIGGER update_discussion_threads_updated_at
BEFORE UPDATE ON public.discussion_threads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for discussion_messages updated_at  
CREATE TRIGGER update_discussion_messages_updated_at
BEFORE UPDATE ON public.discussion_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for messages updated_at
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enhance file_versions table with additional fields for better file management
ALTER TABLE public.file_versions 
ADD COLUMN file_size BIGINT,
ADD COLUMN file_description TEXT,
ADD COLUMN is_supplementary BOOLEAN DEFAULT false,
ADD COLUMN is_archived BOOLEAN DEFAULT false;