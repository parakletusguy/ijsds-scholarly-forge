-- Accept reviewer invitations to test the complete workflow
UPDATE reviews 
SET invitation_status = 'accepted', 
    invitation_accepted_at = now()
WHERE invitation_status = 'pending';