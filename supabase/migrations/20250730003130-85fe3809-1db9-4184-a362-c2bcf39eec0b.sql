-- Add deadline and conflict of interest fields to reviews table
ALTER TABLE public.reviews 
ADD COLUMN deadline_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN conflict_of_interest_declared BOOLEAN DEFAULT false,
ADD COLUMN conflict_of_interest_details TEXT,
ADD COLUMN review_round INTEGER DEFAULT 1,
ADD COLUMN invitation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN invitation_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined'));

-- Create editorial_decisions table for decision tracking
CREATE TABLE public.editorial_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL,
  editor_id UUID NOT NULL,
  decision_type TEXT NOT NULL CHECK (decision_type IN ('desk_reject', 'send_for_review', 'accept', 'reject', 'minor_revision', 'major_revision')),
  decision_rationale TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on editorial_decisions
ALTER TABLE public.editorial_decisions ENABLE ROW LEVEL SECURITY;

-- Create policies for editorial_decisions
CREATE POLICY "Editors can view all editorial decisions" 
ON public.editorial_decisions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.is_editor = true
));

CREATE POLICY "Editors can insert editorial decisions" 
ON public.editorial_decisions 
FOR INSERT 
WITH CHECK (
  auth.uid() = editor_id AND 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_editor = true)
);

CREATE POLICY "Authors can view decisions for their submissions" 
ON public.editorial_decisions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM submissions s 
  WHERE s.id = editorial_decisions.submission_id AND s.submitter_id = auth.uid()
));

-- Create revision_requests table
CREATE TABLE public.revision_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL,
  requested_by UUID NOT NULL,
  revision_type TEXT NOT NULL CHECK (revision_type IN ('minor', 'major')),
  request_details TEXT NOT NULL,
  deadline_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on revision_requests
ALTER TABLE public.revision_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for revision_requests
CREATE POLICY "Editors can manage revision requests" 
ON public.revision_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.is_editor = true
));

CREATE POLICY "Authors can view revision requests for their submissions" 
ON public.revision_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM submissions s 
  WHERE s.id = revision_requests.submission_id AND s.submitter_id = auth.uid()
));

-- Create email_notifications table for tracking sent emails
CREATE TABLE public.email_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_id UUID,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  related_submission_id UUID,
  related_review_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

-- Enable RLS on email_notifications
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for email_notifications
CREATE POLICY "Users can view their own email notifications" 
ON public.email_notifications 
FOR SELECT 
USING (recipient_id = auth.uid());

CREATE POLICY "System can insert email notifications" 
ON public.email_notifications 
FOR INSERT 
WITH CHECK (true);

-- Add notification preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN deadline_reminder_days INTEGER DEFAULT 3;

-- Create trigger for editorial_decisions updated_at
CREATE TRIGGER update_editorial_decisions_updated_at
BEFORE UPDATE ON public.editorial_decisions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for revision_requests updated_at
CREATE TRIGGER update_revision_requests_updated_at
BEFORE UPDATE ON public.revision_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();