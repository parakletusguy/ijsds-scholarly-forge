-- Add new system setting for controlling author reuploads
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES ('author_reupload_enabled', 'true', 'Controls whether authors can reupload/update their manuscript files after initial submission')
ON CONFLICT (setting_key) DO NOTHING;