-- ============================================
-- SUPABASE EMAIL DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create email_database table
CREATE TABLE IF NOT EXISTS email_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, user_id)
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_database_user_id ON email_database(user_id);
CREATE INDEX IF NOT EXISTS idx_email_database_email ON email_database(email);

-- Step 3: Enable Row Level Security
ALTER TABLE email_database ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies
-- Policy: Users can view their own email database
DROP POLICY IF EXISTS "Users can view their own email database" ON email_database;
CREATE POLICY "Users can view their own email database"
  ON email_database
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own email database
DROP POLICY IF EXISTS "Users can insert their own email database" ON email_database;
CREATE POLICY "Users can insert their own email database"
  ON email_database
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own email database
DROP POLICY IF EXISTS "Users can update their own email database" ON email_database;
CREATE POLICY "Users can update their own email database"
  ON email_database
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can delete their own email database
DROP POLICY IF EXISTS "Users can delete their own email database" ON email_database;
CREATE POLICY "Users can delete their own email database"
  ON email_database
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Step 5: Ensure update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_email_database_updated_at ON email_database;
CREATE TRIGGER update_email_database_updated_at
  BEFORE UPDATE ON email_database
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
