import { supabase } from '../lib/supabase';

// MCP Function declarations 
declare function mcp_supabase_apply_migration(name: string, query: string): Promise<any>;
declare function mcp_supabase_execute_sql(query: string): Promise<any>;

/**
 * Sets up the required storage buckets and permissions for production use
 * This function should be run by an administrator with sufficient permissions
 */
export async function setupStorageBuckets() {
  console.log('Setting up storage buckets for production...');
  
  try {
    // Step 1: Create the id-cards bucket if it doesn't exist
    await mcp_supabase_apply_migration(
      "create_id_cards_bucket",
      `
      -- Create id-cards bucket if it doesn't exist
      INSERT INTO storage.buckets (id, name, public)
      SELECT gen_random_uuid(), 'id-cards', true
      WHERE NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'id-cards'
      );
      `
    );
    console.log('✅ Bucket created or verified');
    
    // Step 2: Set up RLS policies for the bucket to allow uploads
    await mcp_supabase_apply_migration(
      "setup_bucket_policies",
      `
      -- Allow public read access to id-cards
      CREATE POLICY IF NOT EXISTS "Allow public read access" 
      ON storage.objects 
      FOR SELECT 
      USING (
        bucket_id = (SELECT id FROM storage.buckets WHERE name = 'id-cards')
        AND auth.role() = 'authenticated'
      );
      
      -- Allow authenticated users to upload files
      CREATE POLICY IF NOT EXISTS "Allow authenticated uploads" 
      ON storage.objects 
      FOR INSERT 
      WITH CHECK (
        bucket_id = (SELECT id FROM storage.buckets WHERE name = 'id-cards')
        AND auth.role() = 'authenticated'
      );
      
      -- Allow users to update their own files
      CREATE POLICY IF NOT EXISTS "Allow authenticated updates" 
      ON storage.objects 
      FOR UPDATE 
      USING (
        bucket_id = (SELECT id FROM storage.buckets WHERE name = 'id-cards')
        AND auth.role() = 'authenticated'
      );
      
      -- Allow users to delete their own files
      CREATE POLICY IF NOT EXISTS "Allow authenticated deletes" 
      ON storage.objects 
      FOR DELETE 
      USING (
        bucket_id = (SELECT id FROM storage.buckets WHERE name = 'id-cards')
        AND auth.role() = 'authenticated'
      );
      `
    );
    console.log('✅ Bucket policies created');
    
    // Step 3: Make sure the bucket is enabled
    await mcp_supabase_execute_sql(`
      -- Ensure the bucket is enabled
      UPDATE storage.buckets
      SET public = true,
          file_size_limit = 5242880, -- 5MB limit
          allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      WHERE name = 'id-cards';
    `);
    console.log('✅ Bucket configured for production use');
    
    // Step 4: Verify the setup
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error verifying buckets:', error);
      return false;
    }
    
    const idCardsBucket = buckets?.find(b => b.name === 'id-cards');
    if (!idCardsBucket) {
      console.error('Could not verify id-cards bucket creation');
      return false;
    }
    
    console.log('✅ Storage setup complete: id-cards bucket is ready for production use');
    return true;
  } catch (error) {
    console.error('Error setting up storage:', error);
    return false;
  }
}

/**
 * Adds anonymous upload permissions (use only if public uploads are needed)
 * WARNING: This allows anyone to upload files without authentication
 */
export async function enableAnonymousUploads() {
  try {
    await mcp_supabase_apply_migration(
      "enable_anonymous_uploads",
      `
      -- Enable anonymous uploads (use with caution!)
      CREATE POLICY IF NOT EXISTS "Allow anonymous uploads" 
      ON storage.objects 
      FOR INSERT 
      WITH CHECK (
        bucket_id = (SELECT id FROM storage.buckets WHERE name = 'id-cards')
      );
      
      -- Enable anonymous reads
      CREATE POLICY IF NOT EXISTS "Allow anonymous reads" 
      ON storage.objects 
      FOR SELECT 
      USING (
        bucket_id = (SELECT id FROM storage.buckets WHERE name = 'id-cards')
      );
      `
    );
    console.log('⚠️ Anonymous uploads enabled - anyone can upload files without authentication');
    return true;
  } catch (error) {
    console.error('Error enabling anonymous uploads:', error);
    return false;
  }
}

/**
 * Example usage in an admin setup component:
 * 
 * import { setupStorageBuckets, enableAnonymousUploads } from './setupStorage';
 * 
 * async function setupProduction() {
 *   // Basic setup for authenticated users
 *   await setupStorageBuckets();
 *   
 *   // Optional: enable anonymous uploads if needed
 *   // await enableAnonymousUploads();
 * }
 */ 