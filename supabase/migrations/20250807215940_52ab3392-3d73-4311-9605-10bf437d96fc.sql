-- Create sample reviewer invitations to test the system
-- First, let's invite reviewers for the submitted papers that need reviews

INSERT INTO reviews (submission_id, reviewer_id, invitation_status, invitation_sent_at, deadline_date)
SELECT 
    s.id as submission_id,
    (SELECT id FROM profiles WHERE is_reviewer = true ORDER BY random() LIMIT 1) as reviewer_id,
    'pending' as invitation_status,
    now() as invitation_sent_at,
    (now() + interval '3 weeks') as deadline_date
FROM submissions s
WHERE s.status IN ('submitted', 'under_review')
AND NOT EXISTS (
    SELECT 1 FROM reviews r WHERE r.submission_id = s.id
)
LIMIT 3;

-- Also add a second reviewer for one submission to test multiple reviewers
INSERT INTO reviews (submission_id, reviewer_id, invitation_status, invitation_sent_at, deadline_date)
SELECT 
    s.id as submission_id,
    (SELECT id FROM profiles WHERE is_reviewer = true AND id != 
        (SELECT reviewer_id FROM reviews WHERE submission_id = s.id LIMIT 1)
     ORDER BY random() LIMIT 1) as reviewer_id,
    'pending' as invitation_status,
    now() as invitation_sent_at,
    (now() + interval '3 weeks') as deadline_date
FROM submissions s
WHERE s.status IN ('submitted', 'under_review')
AND EXISTS (SELECT 1 FROM reviews r WHERE r.submission_id = s.id)
LIMIT 1;