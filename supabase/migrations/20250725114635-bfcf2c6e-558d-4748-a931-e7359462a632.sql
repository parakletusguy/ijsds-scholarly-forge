-- Add additional fields for advanced user management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS orcid_id TEXT,
ADD COLUMN IF NOT EXISTS affiliation TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create file versions table for manuscript version control
CREATE TABLE IF NOT EXISTS public.file_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on file_versions
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for file_versions
CREATE POLICY "Authors and editors can view file versions"
ON public.file_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_editor = true
  ) OR
  EXISTS (
    SELECT 1 FROM public.articles 
    WHERE articles.id = file_versions.article_id 
    AND articles.corresponding_author_email = (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Authors and editors can insert file versions"
ON public.file_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_editor = true
  ) OR
  EXISTS (
    SELECT 1 FROM public.articles 
    WHERE articles.id = file_versions.article_id 
    AND articles.corresponding_author_email = (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- Add trigger for notifications updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_article_id ON public.file_versions(article_id);