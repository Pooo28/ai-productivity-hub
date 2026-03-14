import { createBrowserClient } from '@supabase/ssr'

// Use globalThis to persist the client across HMR reloads in development
// this helps avoid "Lock broken by another request" errors from Web Locks
const getSupabaseBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Build-time safety: warn instead of crashing if env vars are missing
  if (!supabaseUrl || !supabaseKey) {
    if (typeof window === 'undefined') {
      console.warn('Supabase env vars are missing during build. Returning dummy client.');
      return createBrowserClient('https://build-dummy.supabase.co', 'dummy-key');
    }
    throw new Error('Supabase environment variables are missing');
  }

  if (typeof window === 'undefined') {
    return createBrowserClient(supabaseUrl, supabaseKey);
  }

  const global = globalThis as any;
  if (!global.supabaseClient) {
    global.supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)
  }
  return global.supabaseClient;
}

export const supabase = getSupabaseBrowserClient()
