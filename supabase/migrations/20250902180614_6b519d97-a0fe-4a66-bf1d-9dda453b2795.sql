-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  category TEXT,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  slug TEXT UNIQUE NOT NULL
);

-- Create partners table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Blog posts policies
CREATE POLICY "Everyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins and editors can view all blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND (is_admin = true OR is_editor = true)
));

CREATE POLICY "Admins and editors can manage blog posts" 
ON public.blog_posts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND (is_admin = true OR is_editor = true)
));

-- Partners policies
CREATE POLICY "Everyone can view active partners" 
ON public.partners 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage partners" 
ON public.partners 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND is_admin = true
));

-- Create indexes for performance
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_partners_active ON public.partners(is_active);
CREATE INDEX idx_partners_display_order ON public.partners(display_order);

-- Create updated_at triggers
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();