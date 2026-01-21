-- ============================================
-- Update claim_attachments to add settlement_id
-- and relax select policy to not depend on user_id
-- ============================================

-- Ensure function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add settlement_id column
ALTER TABLE claim_attachments
ADD COLUMN IF NOT EXISTS settlement_id TEXT;

-- Backfill settlement_id from claim_review_queue
UPDATE claim_attachments ca
SET settlement_id = crq.settlement_id
FROM claim_review_queue crq
WHERE ca.claim_id = crq.id
  AND ca.settlement_id IS NULL;

-- Relax select policy to allow all authenticated users to view attachments
DROP POLICY IF EXISTS "Users can view their own claim attachments" ON claim_attachments;
CREATE POLICY "Authenticated can view claim attachments"
  ON claim_attachments
  FOR SELECT
  TO authenticated
  USING (true);

-- Keep insert/update/delete restricted to owner (if already set)
-- (Existing policies from initial migration remain)

-- Ensure updated_at trigger exists
DROP TRIGGER IF EXISTS update_claim_attachments_updated_at ON claim_attachments;
CREATE TRIGGER update_claim_attachments_updated_at
  BEFORE UPDATE ON claim_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
