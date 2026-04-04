-- Add production and publication statuses to articles table
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_status_check;

ALTER TABLE public.articles ADD CONSTRAINT articles_status_check 
CHECK (status IN (
    'draft', 
    'submitted', 
    'under_review', 
    'accepted', 
    'in_production', 
    'copyediting', 
    'proofreading', 
    'typesetting', 
    'processed', 
    'ready_for_publication', 
    'published', 
    'rejected'
));
