import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// For production, these MUST be set in Vercel environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Vercel environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

