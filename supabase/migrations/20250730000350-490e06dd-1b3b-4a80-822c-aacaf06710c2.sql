-- Add rejection messages table for anonymous feedback
CREATE TABLE public.rejection_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL,
  message text NOT NULL,
  suggested_corrections text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NOT NULL -- editor who created the message
);

-- Enable RLS
ALTER TABLE public.rejection_messages ENABLE ROW LEVEL SECURITY;

-- Authors can view rejection messages for their submissions
CREATE POLICY "Authors can view rejection messages for their submissions" 
ON public.rejection_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM submissions s 
    WHERE s.id = rejection_messages.submission_id 
    AND s.submitter_id = auth.uid()
  )
);

-- Editors can insert and view all rejection messages
CREATE POLICY "Editors can insert rejection messages" 
ON public.rejection_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_editor = true
  )
);

CREATE POLICY "Editors can view all rejection messages" 
ON public.rejection_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_editor = true
  )
);

-- Update the handle_new_user function to accept role information
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, is_editor, is_reviewer)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'is_editor')::boolean, false),
    COALESCE((NEW.raw_user_meta_data ->> 'is_reviewer')::boolean, false)
  );
  RETURN NEW;
END;
$$;

-- Add approval status to submissions
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS approved_by_editor boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid;