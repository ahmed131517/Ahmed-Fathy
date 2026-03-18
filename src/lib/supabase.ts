import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Sync will be disabled.');
}

export const supabase = createClient(
  supabaseUrl || 'https://tffxcpgjbunstdpthrom.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZnhjcGdqYnVuc3RkcHRocm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzU2NjgsImV4cCI6MjA4ODgxMTY2OH0.fv-cvJe7oT7RUsF_sNlyBU9Nhlp_29Z0eH_Qxku5IXc'
);
