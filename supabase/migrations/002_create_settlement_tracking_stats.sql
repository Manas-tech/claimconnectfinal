-- Create a view for tracking statistics (for lawyer dashboard)
CREATE OR REPLACE VIEW settlement_tracking_stats AS
SELECT 
  settlement_id,
  COUNT(*) as tracked_count,
  COUNT(DISTINCT user_id) as unique_users
FROM tracked_settlements
GROUP BY settlement_id;

-- Grant access to authenticated users (lawyers can query this)
-- Note: You may want to create a separate table for lawyer access or adjust RLS policies
