-- Create activity_logs table for tracking dashboard activities
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('notification_created', 'settlement_tracked')),
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type ON activity_logs(activity_type);

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Lawyers can view all activity logs
DROP POLICY IF EXISTS "Lawyers can view all activity logs" ON activity_logs;
CREATE POLICY "Lawyers can view all activity logs"
  ON activity_logs
  FOR SELECT
  USING (true);

-- Policy: System can insert activity logs
DROP POLICY IF EXISTS "System can insert activity logs" ON activity_logs;
CREATE POLICY "System can insert activity logs"
  ON activity_logs
  FOR INSERT
  WITH CHECK (true);
