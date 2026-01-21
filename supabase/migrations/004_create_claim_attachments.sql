-- Create claim_attachments table
CREATE TABLE IF NOT EXISTS claim_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_claim_attachments_claim_id ON claim_attachments(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_attachments_user_id ON claim_attachments(user_id);

-- Enable RLS
ALTER TABLE claim_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own claim attachments" ON claim_attachments;
CREATE POLICY "Users can view their own claim attachments"
  ON claim_attachments
  FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own claim attachments" ON claim_attachments;
CREATE POLICY "Users can insert their own claim attachments"
  ON claim_attachments
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own claim attachments" ON claim_attachments;
CREATE POLICY "Users can update their own claim attachments"
  ON claim_attachments
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete their own claim attachments" ON claim_attachments;
CREATE POLICY "Users can delete their own claim attachments"
  ON claim_attachments
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_claim_attachments_updated_at
  BEFORE UPDATE ON claim_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
