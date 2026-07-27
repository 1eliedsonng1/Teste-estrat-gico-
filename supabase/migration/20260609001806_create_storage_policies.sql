
-- Create storage bucket for proof uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to upload
CREATE POLICY "allow_public_upload_proofs" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'proofs');

-- Allow anyone to read
CREATE POLICY "allow_public_read_proofs" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'proofs');
