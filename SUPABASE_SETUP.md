# Supabase Database Setup Guide

This guide will help you set up the required database tables in Supabase for the tracking functionality.

## Prerequisites

1. A Supabase project (create one at https://supabase.com)
2. Your Supabase project URL and anon key (already in your `.env` file)

## Step 1: Access Supabase SQL Editor

1. Log in to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Create the Tracked Settlements Table

Copy and paste the following SQL into the SQL Editor and click **Run**:

```sql
-- Create tracked_settlements table
CREATE TABLE IF NOT EXISTS tracked_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  amount TEXT,
  deadline TEXT,
  estimated_payout TEXT,
  proof_of_purchase BOOLEAN DEFAULT false,
  logo_url TEXT,
  claim_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(settlement_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tracked_settlements_user_id ON tracked_settlements(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_settlements_settlement_id ON tracked_settlements(settlement_id);

-- Enable Row Level Security
ALTER TABLE tracked_settlements ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own tracked settlements
CREATE POLICY "Users can view their own tracked settlements"
  ON tracked_settlements
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Create policy: Users can insert their own tracked settlements
CREATE POLICY "Users can insert their own tracked settlements"
  ON tracked_settlements
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Create policy: Users can delete their own tracked settlements
CREATE POLICY "Users can delete their own tracked settlements"
  ON tracked_settlements
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tracked_settlements_updated_at
  BEFORE UPDATE ON tracked_settlements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 3: Create Tracking Statistics View (Optional - for Lawyer Dashboard)

This view helps count how many users are tracking each settlement:

```sql
-- Create a view for tracking statistics
CREATE OR REPLACE VIEW settlement_tracking_stats AS
SELECT 
  settlement_id,
  COUNT(*) as tracked_count,
  COUNT(DISTINCT user_id) as unique_users
FROM tracked_settlements
GROUP BY settlement_id;
```

## Step 4: Set Up Lawyer Access (For Dashboard)

If you want lawyers to see tracking counts, you need to create a policy that allows them to read the statistics. You can either:

**Option A: Create a service role function** (Recommended for production)

```sql
-- Create a function that lawyers can call to get tracking counts
CREATE OR REPLACE FUNCTION get_settlement_tracking_count(settlement_id_param TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM tracked_settlements
    WHERE settlement_id = settlement_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_settlement_tracking_count(TEXT) TO authenticated;
```

**Option B: Allow lawyers to read all tracking data** (Simpler but less secure)

```sql
-- Create a policy for lawyers (you'll need to identify lawyers by role or email)
CREATE POLICY "Lawyers can view all tracked settlements"
  ON tracked_settlements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id::text = auth.uid()::text
      AND (auth.users.email LIKE '%@lawfirm.com' OR auth.users.raw_user_meta_data->>'role' = 'lawyer')
    )
  );
```

## Step 5: Verify the Setup

1. Go to **Table Editor** in Supabase
2. You should see the `tracked_settlements` table
3. Check that Row Level Security (RLS) is enabled
4. Verify the policies are created under **Authentication > Policies**

## Important Notes

- **Row Level Security (RLS)**: This ensures users can only see/modify their own tracked settlements
- **Unique Constraint**: The `UNIQUE(settlement_id, user_id)` prevents duplicate tracking entries
- **Indexes**: Added for better query performance
- **Timestamps**: `created_at` and `updated_at` are automatically managed

## Testing

After setup, test by:
1. Logging in as a regular user
2. Tracking a settlement
3. Checking the `tracked_settlements` table in Supabase to see the entry
4. Verifying the lawyer dashboard shows the correct count

## Troubleshooting

If you encounter issues:

1. **"Permission denied"**: Check that RLS policies are correctly set up
2. **"Function does not exist"**: Make sure you ran all SQL statements in order
3. **Counts not showing**: Verify the lawyer access policy or function is set up correctly

For more help, check the Supabase documentation: https://supabase.com/docs
