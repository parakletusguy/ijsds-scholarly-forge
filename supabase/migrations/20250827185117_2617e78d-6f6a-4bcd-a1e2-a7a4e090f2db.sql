-- Fix security issues from linter

-- Update function to have proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a notification to trigger welcome email
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    read
  ) VALUES (
    NEW.id,
    'Welcome to IJSDS',
    'Welcome to the International Journal of Social Work and Development Studies! Your account has been created successfully.',
    'success',
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Ensure RLS is enabled on all public tables that should have it
-- (Check which tables might not have RLS enabled)
DO $$ 
DECLARE
  table_record RECORD;
BEGIN
  -- Enable RLS on all public tables that don't have it enabled
  FOR table_record IN 
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN (
      SELECT tablename 
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      WHERE c.relrowsecurity = true 
      AND t.schemaname = 'public'
    )
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 
                   table_record.schemaname, table_record.tablename);
    RAISE NOTICE 'Enabled RLS on %.%', table_record.schemaname, table_record.tablename;
  END LOOP;
END $$;