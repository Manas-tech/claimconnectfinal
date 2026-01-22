# Activity Logs Setup Guide

This guide explains how to set up the real-time activity tracking system for the lawyer dashboard.

## Database Setup

Run the migration file in your Supabase SQL Editor:

```sql
-- File: supabase/migrations/006_create_activity_logs.sql
```

Or run the SQL directly:

```sql
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
```

## Features

### Real-time Activity Tracking

The dashboard now tracks two types of activities:

1. **Notification Created**: When a lawyer creates and sends a notification
   - Technical language: "Notification broadcast initiated: [title]"
   - Includes recipient count, type, and notification details

2. **Settlement Tracked**: When a user tracks a settlement from `/settlements`
   - Technical language: "Settlement tracking initiated: [settlement name]"
   - Includes settlement ID, company, payout info, and proof requirements

### Real-time Updates

The dashboard uses Supabase real-time subscriptions to automatically update the Recent Activity section when new activities occur, without requiring a page refresh.

## Activity Format

Activities are displayed with:
- **Icon**: Different icons for different activity types (Bell for notifications, Gavel for settlements)
- **Title**: Technical description of the activity
- **Description**: Detailed technical information
- **Timestamp**: Relative time (e.g., "2 minutes ago")

## Technical Language Examples

- "Notification broadcast initiated: Settlement Deadline Reminder"
- "Notification payload dispatched to 25 recipient(s) via SMTP gateway"
- "Settlement tracking initiated: Belkin Power Bank Class Action Settlement"
- "User initiated tracking for settlement ID: settlement-123"
