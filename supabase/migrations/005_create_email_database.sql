-- Create email_database table
CREATE TABLE IF NOT EXISTS email_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_database_user_id ON email_database(user_id);
CREATE INDEX IF NOT EXISTS idx_email_database_email ON email_database(email);

-- RLS
ALTER TABLE email_database ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own email database" ON email_database;
CREATE POLICY "Users can view their own email database"
  ON email_database
  FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own email database" ON email_database;
CREATE POLICY "Users can insert their own email database"
  ON email_database
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own email database" ON email_database;
CREATE POLICY "Users can update their own email database"
  ON email_database
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete their own email database" ON email_database;
CREATE POLICY "Users can delete their own email database"
  ON email_database
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_email_database_updated_at
  BEFORE UPDATE ON email_database
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
