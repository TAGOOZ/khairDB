import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://xcyzvtkkgmuezvdaqlgv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjeXp2dGtrZ211ZXp2ZGFxbGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MzgyNDYsImV4cCI6MjA0OTAxNDI0Nn0.8YolmP36r7hRSVh3T0qaEa1i0DEBlZ0rnGKsLOW-oMQ';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
