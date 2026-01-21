# Claim Attachments Setup Guide

This guide will help you set up the document upload and comment functionality for claim reviews.

## Prerequisites

1. Supabase project with authentication enabled
2. Storage bucket access configured

## Step 1: Create the Database Table

Run the SQL migration file in Supabase SQL Editor:

**File:** `supabase/migrations/004_create_claim_attachments.sql`

This creates the `claim_attachments` table to store:
- Document URLs (from file uploads or external URLs)
- File names
- Comments and discussion text
- User and claim associations

## Step 2: Set Up Supabase Storage

Run the storage setup file in Supabase SQL Editor:

**File:** `supabase_storage_setup.sql`

This will:
1. Create a public storage bucket named `claim-documents`
2. Set up policies for authenticated users to:
   - Upload documents
   - Read/view documents
   - Delete their own documents

### Alternative: Manual Storage Setup

If you prefer to set up storage manually:

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name: `claim-documents`
4. Make it **Public**
5. Click **Create bucket**

Then set up policies:
- Go to **Storage** → **Policies** → `claim-documents`
- Create policies for INSERT, SELECT, and DELETE for authenticated users

## Step 3: Verify Setup

After running both SQL files, verify:

1. **Database Table:**
   ```sql
   SELECT * FROM claim_attachments LIMIT 1;
   ```

2. **Storage Bucket:**
   - Go to **Storage** → You should see `claim-documents` bucket
   - Try uploading a test file

## Features

Once set up, users can:

1. **Upload Documents:**
   - Click the "+" button in the Actions column
   - Upload PDF, DOC, DOCX, or image files (max 10MB)
   - Files are stored in Supabase Storage

2. **Add Document URLs:**
   - Provide a URL to an external document
   - Useful for linking to documents hosted elsewhere

3. **Add Comments:**
   - Write detailed comments, notes, or discussion points
   - Supports long paragraphs and multiple lines

## File Storage Structure

Uploaded files are stored in Supabase Storage with the path:
```
claim-documents/
  └── {claim_id}/
      └── {timestamp}_{filename}
```

## Security

- Only authenticated users can upload/view documents
- Users can only see their own attachments (via RLS policies)
- File size limit: 10MB
- Allowed file types: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP

## Troubleshooting

**Issue: "Storage bucket not found"**
- Make sure you ran `supabase_storage_setup.sql`
- Or manually created the `claim-documents` bucket

**Issue: "Permission denied"**
- Check that storage policies are set up correctly
- Verify the bucket is public or policies allow authenticated access

**Issue: "File upload fails"**
- Check file size (must be < 10MB)
- Verify file type is supported
- Check browser console for detailed error messages
