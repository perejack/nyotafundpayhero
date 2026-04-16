-- Storage Bucket Setup for NYOTA Fund
-- Run this in your Supabase SQL Editor to set up the storage bucket

-- Create the storage bucket for loan documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('loan-documents', 'loan-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow anyone to upload files (for application submissions)
CREATE POLICY "Allow public uploads" ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id = 'loan-documents');

-- Policy: Allow anyone to read files (for viewing/downloading documents)
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'loan-documents');

-- Policy: Allow authenticated users to delete files (for admin cleanup)
CREATE POLICY "Allow admin delete access" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'loan-documents');
