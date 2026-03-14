import { createBrowserClient } from '@supabase/ssr'

// Use globalThis to persist the client across HMR reloads in development
// this helps avoid "Lock broken by another request" errors from Web Locks
const getSupabaseBrowserClient = () => {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  const global = globalThis as any;
  
  if (!global.supabaseClient) {
    global.supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  return global.supabaseClient;
}

export const supabase = getSupabaseBrowserClient()
