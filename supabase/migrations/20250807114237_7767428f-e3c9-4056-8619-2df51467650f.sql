-- Workflow State Management: Create audit trail table
CREATE TABLE public.workflow_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL,
  change_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit log
CREATE POLICY "Editors can view all audit logs"
ON public.workflow_audit_log
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.is_editor = true
));

CREATE POLICY "System can insert audit logs"
ON public.workflow_audit_log
FOR INSERT
WITH CHECK (true);

-- Workflow validation function
CREATE OR REPLACE FUNCTION public.validate_status_transition(
  old_status TEXT,
  new_status TEXT,
  user_role TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Define valid transitions
  CASE 
    WHEN old_status = 'submitted' AND new_status IN ('under_review', 'desk_rejected') THEN
      RETURN user_role = 'editor';
    WHEN old_status = 'under_review' AND new_status IN ('revision_requested', 'accepted', 'rejected') THEN
      RETURN user_role = 'editor';
    WHEN old_status = 'revision_requested' AND new_status = 'revised' THEN
      RETURN true; -- Authors can submit revisions
    WHEN old_status = 'revised' AND new_status IN ('under_review', 'accepted', 'rejected') THEN
      RETURN user_role = 'editor';
    WHEN old_status = 'accepted' AND new_status = 'published' THEN
      RETURN user_role = 'editor';
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for workflow audit logging
CREATE OR REPLACE FUNCTION public.log_workflow_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.workflow_audit_log (
    submission_id,
    old_status,
    new_status,
    changed_by,
    change_reason,
    metadata
  ) VALUES (
    NEW.id,
    OLD.status,
    NEW.status,
    auth.uid(),
    'Status change via application',
    jsonb_build_object(
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for submissions status changes
CREATE TRIGGER workflow_audit_trigger
  AFTER UPDATE OF status ON public.submissions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.log_workflow_change();