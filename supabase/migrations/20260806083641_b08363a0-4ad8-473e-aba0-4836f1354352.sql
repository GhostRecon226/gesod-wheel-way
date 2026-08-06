CREATE POLICY "Anyone can view auction images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'auction-images');

CREATE POLICY "Admins can upload auction images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'auction-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update auction images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'auction-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete auction images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'auction-images' AND public.has_role(auth.uid(), 'admin'::app_role));