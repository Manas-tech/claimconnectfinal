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
