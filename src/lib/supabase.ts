import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseEnabled = !!(supabaseUrl && supabaseAnonKey);

const createDummyResponse = () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } });

// A robust dummy client that handles chaining and terminal calls
const dummyClient = {
  from: () => {
    const builder: any = new Proxy({}, {
      get: (target, prop) => {
        if (prop === 'then') {
          return (onfulfilled: any) => createDummyResponse().then(onfulfilled);
        }
        // These methods usually represent the end of a chain or a terminal operation
        if (['insert', 'upsert', 'update', 'delete', 'single', 'maybeSingle', 'execute'].includes(prop as string)) {
          return () => createDummyResponse();
        }
        // For everything else (select, order, limit, eq, gt, etc.), return the builder itself for chaining
        return () => builder;
      }
    });
    return builder;
  },
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => createDummyResponse(),
    signOut: () => Promise.resolve({ error: null }),
  },
  channel: () => {
    const channelObj = {
      on: () => channelObj,
      subscribe: () => ({}),
    };
    return channelObj;
  },
  removeChannel: () => ({}),
} as any;

export const supabase = supabaseEnabled 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : dummyClient;
