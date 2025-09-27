-- Create system settings table for managing application configuration
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

CREATE POLICY "Everyone can read system settings" 
ON public.system_settings 
FOR SELECT 
USING (true);

-- Insert initial settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES 
('submission_enabled', 'true', 'Controls whether new submissions are accepted'),
('maintenance_mode', 'false', 'Controls whether the system is in maintenance mode'),
('max_file_size_mb', '10', 'Maximum file size for uploads in MB');

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();