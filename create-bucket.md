# How to Create the Storage Bucket in Supabase

## Manual Bucket Creation

Since the automatic bucket creation is failing, you need to create the bucket manually in your Supabase dashboard:

### Steps:

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Create the Bucket**
   - **Name**: `ad-media`
   - **Public bucket**: ✅ Check this box
   - **File size limit**: `10MB`
   - **Allowed MIME types**: `image/*,video/*`

4. **Set up RLS Policies**
   After creating the bucket, go to "Policies" and add these policies:

   ```sql
   -- Allow users to upload their own files
   CREATE POLICY "Users can upload their own ad media" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'ad-media' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to view their own files
   CREATE POLICY "Users can view their own ad media" ON storage.objects
   FOR SELECT USING (bucket_id = 'ad-media' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to update their own files
   CREATE POLICY "Users can update their own ad media" ON storage.objects
   FOR UPDATE USING (bucket_id = 'ad-media' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to delete their own files
   CREATE POLICY "Users can delete their own ad media" ON storage.objects
   FOR DELETE USING (bucket_id = 'ad-media' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

5. **Test the Upload**
   - After creating the bucket and policies, try uploading a file again
   - The upload should now work properly

## Alternative: Use SQL Editor

You can also run this SQL in the Supabase SQL Editor:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-media', 'ad-media', true);

-- Create the policies
CREATE POLICY "Users can upload their own ad media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'ad-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own ad media" ON storage.objects
FOR SELECT USING (bucket_id = 'ad-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own ad media" ON storage.objects
FOR UPDATE USING (bucket_id = 'ad-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own ad media" ON storage.objects
FOR DELETE USING (bucket_id = 'ad-media' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Fixed Issues

✅ **Upload button text color**: Fixed to black (`text-gray-700`)
✅ **Progress bar**: Added blue progress bar during upload
✅ **Paperclip icon**: Added for better UX
✅ **Better error handling**: More informative error messages 