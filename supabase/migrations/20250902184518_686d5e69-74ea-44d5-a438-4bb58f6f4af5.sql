-- Add foreign key constraint between blog_posts and profiles
ALTER TABLE public.blog_posts 
ADD CONSTRAINT blog_posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;