import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn('Supabase credentials missing. Sync will be disabled.');
}

const dummyClient = {
  from: () => ({
    select: () => ({
      gt: () => ({ data: [], error: 'Supabase not configured' }),
      eq: () => ({ data: [], error: 'Supabase not configured' }),
    }),
    upsert: () => ({
      select: () => ({ data: [], error: 'Supabase not configured' }),
    }),
  }),
  channel: () => {
    const channelObj = {
      on: () => channelObj,
      subscribe: () => ({}),
    };
    return channelObj;
  },
  removeChannel: () => ({}),
} as any;

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : dummyClient;
