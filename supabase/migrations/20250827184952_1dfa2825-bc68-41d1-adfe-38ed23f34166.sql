-- Function to send welcome email notifications after user signup
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send welcome emails when a new profile is created
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- Enable realtime for notifications table if not already enabled
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.notifications;