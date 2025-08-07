-- Fix security warnings: Set search_path for functions
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix search_path for log_workflow_change function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Automated reviewer matching algorithm
CREATE OR REPLACE FUNCTION public.find_potential_reviewers(
  _submission_id UUID,
  _subject_area TEXT,
  _keywords TEXT[],
  _limit INTEGER DEFAULT 10
) RETURNS TABLE (
  reviewer_id UUID,
  match_score NUMERIC,
  profile_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as reviewer_id,
    -- Calculate match score based on expertise and availability
    (
      CASE WHEN p.affiliation ILIKE '%' || _subject_area || '%' THEN 3.0 ELSE 0.0 END +
      CASE WHEN p.bio ILIKE ANY(SELECT '%' || keyword || '%' FROM unnest(_keywords) as keyword) THEN 2.0 ELSE 0.0 END +
      -- Bonus for less busy reviewers
      CASE WHEN reviewer_workload.active_reviews < 3 THEN 1.0 ELSE 0.0 END +
      -- Random factor for fairness
      random() * 0.5
    ) as match_score,
    jsonb_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'affiliation', p.affiliation,
      'bio', p.bio,
      'active_reviews', reviewer_workload.active_reviews
    ) as profile_data
  FROM profiles p
  LEFT JOIN (
    SELECT 
      reviewer_id,
      COUNT(*) as active_reviews
    FROM reviews 
    WHERE invitation_status = 'accepted' 
    AND submitted_at IS NULL
    GROUP BY reviewer_id
  ) reviewer_workload ON p.id = reviewer_workload.reviewer_id
  WHERE p.is_reviewer = true
  AND p.id != (SELECT submitter_id FROM submissions WHERE id = _submission_id)
  -- Exclude reviewers who already reviewed this submission
  AND p.id NOT IN (
    SELECT reviewer_id FROM reviews WHERE submission_id = _submission_id
  )
  ORDER BY match_score DESC
  LIMIT _limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Review quality scoring function
CREATE OR REPLACE FUNCTION public.calculate_review_quality_score(
  _review_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  score NUMERIC := 0;
  review_data RECORD;
BEGIN
  SELECT 
    r.*,
    length(r.comments_to_author) as author_comment_length,
    length(r.comments_to_editor) as editor_comment_length,
    (submitted_at - invitation_accepted_at) as review_duration
  INTO review_data
  FROM reviews r
  WHERE r.id = _review_id;
  
  IF review_data IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Score based on comment quality (length and detail)
  score := score + LEAST(review_data.author_comment_length / 200.0, 5.0);
  score := score + LEAST(review_data.editor_comment_length / 100.0, 3.0);
  
  -- Timeliness score (submitted within deadline gets bonus)
  IF review_data.submitted_at <= review_data.deadline_date THEN
    score := score + 2.0;
  END IF;
  
  -- Bonus for providing specific recommendation
  IF review_data.recommendation IS NOT NULL THEN
    score := score + 1.0;
  END IF;
  
  -- Bonus for conflict of interest transparency
  IF review_data.conflict_of_interest_declared = true AND 
     review_data.conflict_of_interest_details IS NOT NULL THEN
    score := score + 1.0;
  END IF;
  
  RETURN LEAST(score, 10.0); -- Cap at 10
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Performance analytics query function
CREATE OR REPLACE FUNCTION public.get_editorial_analytics(
  _start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  _end_date DATE DEFAULT CURRENT_DATE
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  WITH submission_stats AS (
    SELECT 
      COUNT(*) as total_submissions,
      COUNT(*) FILTER (WHERE status = 'published') as published_count,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
      AVG(EXTRACT(epoch FROM (updated_at - submitted_at))/86400) as avg_processing_days
    FROM submissions 
    WHERE submitted_at BETWEEN _start_date AND _end_date
  ),
  review_stats AS (
    SELECT 
      COUNT(*) as total_reviews,
      COUNT(*) FILTER (WHERE submitted_at IS NOT NULL) as completed_reviews,
      AVG(EXTRACT(epoch FROM (submitted_at - invitation_sent_at))/86400) as avg_review_days,
      AVG(public.calculate_review_quality_score(id)) as avg_quality_score
    FROM reviews r
    JOIN submissions s ON r.submission_id = s.id
    WHERE s.submitted_at BETWEEN _start_date AND _end_date
  )
  SELECT jsonb_build_object(
    'submissions', row_to_json(submission_stats.*),
    'reviews', row_to_json(review_stats.*),
    'period', jsonb_build_object(
      'start_date', _start_date,
      'end_date', _end_date
    )
  ) INTO result
  FROM submission_stats, review_stats;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';