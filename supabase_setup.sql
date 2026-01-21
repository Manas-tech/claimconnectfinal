    -- ============================================
    -- SUPABASE DATABASE SETUP
    -- Run this entire file in Supabase SQL Editor
    -- ============================================

    -- Step 1: Create tracked_settlements table
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

    -- Step 2: Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_tracked_settlements_user_id ON tracked_settlements(user_id);
    CREATE INDEX IF NOT EXISTS idx_tracked_settlements_settlement_id ON tracked_settlements(settlement_id);

    -- Step 3: Enable Row Level Security
    ALTER TABLE tracked_settlements ENABLE ROW LEVEL SECURITY;

    -- Step 4: Create RLS Policies
    -- Policy: Users can view their own tracked settlements
    DROP POLICY IF EXISTS "Users can view their own tracked settlements" ON tracked_settlements;
    CREATE POLICY "Users can view their own tracked settlements"
    ON tracked_settlements
    FOR SELECT
    USING (auth.uid()::text = user_id);

    -- Policy: Users can insert their own tracked settlements
    DROP POLICY IF EXISTS "Users can insert their own tracked settlements" ON tracked_settlements;
    CREATE POLICY "Users can insert their own tracked settlements"
    ON tracked_settlements
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

    -- Policy: Users can update their own tracked settlements
    DROP POLICY IF EXISTS "Users can update their own tracked settlements" ON tracked_settlements;
    CREATE POLICY "Users can update their own tracked settlements"
    ON tracked_settlements
    FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

    -- Policy: Users can delete their own tracked settlements
    DROP POLICY IF EXISTS "Users can delete their own tracked settlements" ON tracked_settlements;
    CREATE POLICY "Users can delete their own tracked settlements"
    ON tracked_settlements
    FOR DELETE
    USING (auth.uid()::text = user_id);

    -- Step 5: Create function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Step 6: Create trigger to automatically update updated_at
    DROP TRIGGER IF EXISTS update_tracked_settlements_updated_at ON tracked_settlements;
    CREATE TRIGGER update_tracked_settlements_updated_at
    BEFORE UPDATE ON tracked_settlements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    -- Step 7: Create function for lawyers to get tracking counts
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

    -- Step 8: Create view for tracking statistics (optional, for analytics)
    CREATE OR REPLACE VIEW settlement_tracking_stats AS
    SELECT 
    settlement_id,
    COUNT(*) as tracked_count,
    COUNT(DISTINCT user_id) as unique_users
    FROM tracked_settlements
    GROUP BY settlement_id;

    -- ============================================
    -- VERIFICATION QUERIES (Run these to test)
    -- ============================================

    -- Check if table exists
    -- SELECT * FROM information_schema.tables WHERE table_name = 'tracked_settlements';

    -- Check if RLS is enabled
    -- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'tracked_settlements';

    -- Check policies
    -- SELECT * FROM pg_policies WHERE tablename = 'tracked_settlements';

-- Test the function (replace '1' with an actual settlement_id)
-- SELECT get_settlement_tracking_count('1');

-- ============================================
-- Step 9: Create claim_review_queue table
-- ============================================

CREATE TABLE IF NOT EXISTS claim_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id TEXT NOT NULL,
  settlement_name TEXT NOT NULL,
  title TEXT,
  category TEXT,
  settlement_amount_total TEXT,
  claim_deadline_date DATE,
  case_number TEXT,
  company TEXT,
  estimated_payout TEXT,
  proof_of_purchase BOOLEAN DEFAULT false,
  user_id TEXT NOT NULL,
  status TEXT DEFAULT 'Pending Review',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_claim_review_queue_user_id ON claim_review_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_claim_review_queue_settlement_id ON claim_review_queue(settlement_id);

-- Enable RLS
ALTER TABLE claim_review_queue ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own claim review items" ON claim_review_queue;
CREATE POLICY "Users can view their own claim review items"
  ON claim_review_queue
  FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own claim review items" ON claim_review_queue;
CREATE POLICY "Users can insert their own claim review items"
  ON claim_review_queue
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own claim review items" ON claim_review_queue;
CREATE POLICY "Users can update their own claim review items"
  ON claim_review_queue
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete their own claim review items" ON claim_review_queue;
CREATE POLICY "Users can delete their own claim review items"
  ON claim_review_queue
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_claim_review_queue_updated_at
  BEFORE UPDATE ON claim_review_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
