-- ============================================
-- UPDATE EXISTING claim_review_queue TABLE
-- Run this if you already created the table earlier
-- ============================================

-- Ensure the update_updated_at_column function exists (from original setup)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add missing columns to claim_review_queue table
ALTER TABLE claim_review_queue 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS settlement_amount_total TEXT,
ADD COLUMN IF NOT EXISTS claim_deadline_date DATE,
ADD COLUMN IF NOT EXISTS case_number TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS estimated_payout TEXT,
ADD COLUMN IF NOT EXISTS proof_of_purchase BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records: set title = settlement_name if title is null
UPDATE claim_review_queue 
SET title = settlement_name 
WHERE title IS NULL;

-- Create trigger for updated_at (if it doesn't exist)
DROP TRIGGER IF EXISTS update_claim_review_queue_updated_at ON claim_review_queue;
CREATE TRIGGER update_claim_review_queue_updated_at
  BEFORE UPDATE ON claim_review_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the changes
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'claim_review_queue'
-- ORDER BY ordinal_position;
