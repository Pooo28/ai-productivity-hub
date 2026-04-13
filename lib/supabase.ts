import { createBrowserClient } from '@supabase/ssr'

// Use globalThis to persist the client across HMR reloads in development
// this helps avoid "Lock broken by another request" errors from Web Locks
const getSupabaseBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Supabase Init:', { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey });

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
    global.supabaseClient = createBrowserClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Custom lock implementation to handle "Lock broken by another request"
        // which occurs frequently in Next.js 15 / HMR environments
        ...(typeof window !== 'undefined' && 'locks' in navigator ? {
          lock: {
            acquireLock: async (name: string, callback: () => Promise<any>) => {
              try {
                const result = await navigator.locks.request(name, callback);
                return result;
              } catch (e: any) {
                if (e.name === 'AbortError' || e.message?.includes('steal') || e.message?.includes('broken')) {
                  console.warn('Supabase lock stolen, suppressing error.');
                  return null;
                }
                throw e;
              }
            }
          }
        } : {})
      }
    })
  }
  return global.supabaseClient;
}

export const supabase = getSupabaseBrowserClient()
