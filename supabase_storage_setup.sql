-- ============================================
-- SUPABASE STORAGE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Create storage bucket for claim documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('claim-documents', 'claim-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy: Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated users can upload claim documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload claim documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'claim-documents');

-- Create storage policy: Allow authenticated users to read
DROP POLICY IF EXISTS "Authenticated users can read claim documents" ON storage.objects;
CREATE POLICY "Authenticated users can read claim documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'claim-documents');

-- Create storage policy: Allow authenticated users to delete their own files
DROP POLICY IF EXISTS "Authenticated users can delete their own claim documents" ON storage.objects;
CREATE POLICY "Authenticated users can delete their own claim documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'claim-documents');
