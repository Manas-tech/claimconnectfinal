-- Create claim_review_queue table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_claim_review_queue_user_id ON claim_review_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_claim_review_queue_settlement_id ON claim_review_queue(settlement_id);

-- RLS
ALTER TABLE claim_review_queue ENABLE ROW LEVEL SECURITY;

-- Policies
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

-- Create trigger to update updated_at
CREATE TRIGGER update_claim_review_queue_updated_at
  BEFORE UPDATE ON claim_review_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
