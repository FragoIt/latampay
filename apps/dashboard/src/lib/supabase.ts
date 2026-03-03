import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton — only instantiated at request time, never during build/prerender
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in Vercel project settings.');
    }
    _client = createClient(url, key);
  }
  return _client;
}

// Backward-compatible proxy so existing `supabase.from(...)` calls keep working
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});
