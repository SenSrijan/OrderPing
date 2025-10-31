import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { PostgrestError, PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { cookies } from 'next/headers'
import { type CookieOptions } from '@supabase/ssr'
import { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types'

declare global {
  type Tables = Database['public']['Tables']
  type CustomerRow = Tables['customers']['Row']
  type OrderRow = Tables['orders']['Row']
}

export type TypedSupabaseClient = SupabaseClient<Database>

declare global {
  namespace PostgrestRequestBuilder {
    interface PostgrestRequestBuilder<Schema extends GenericSchema> {
      insert<Table extends keyof Schema['Tables']>(
        values: Schema['Tables'][Table]['Insert'],
        options?: { count?: 'exact' | 'planned' | 'estimated' }
      ): Promise<PostgrestSingleResponse<Schema['Tables'][Table]['Row']>>
      update<Table extends keyof Schema['Tables']>(
        values: Schema['Tables'][Table]['Update'],
        options?: { count?: 'exact' | 'planned' | 'estimated' }
      ): Promise<PostgrestSingleResponse<Schema['Tables'][Table]['Row']>>
    }
  }
}

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Use the newer getAll / setAll helpers expected by @supabase/ssr.
      // Also provide fallbacks for older get/set/remove usage.
      cookies: ({
        getAll: () => {
          // next/headers cookieStore.getAll() returns an array of cookies
          // keep the raw return value since the supabase lib expects that shape
          return cookieStore.getAll()
        },
        setAll: (cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { path: '/', ...(options as any) })
            )
          } catch (e) {
            // When called from a Server Component the cookie store may be immutable.
            // In that case we silently ignore setting cookies here — the caller
            // should ensure cookie changes are applied in a route handler or middleware.
          }
        },
        // Backwards-compatible single-cookie helpers
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          try {
            cookieStore.set(name, value, {
              path: '/',
              ...options,
            })
          } catch (e) {
            // ignore in server components
          }
        },
        remove: (name: string, _options?: CookieOptions) => {
          try {
            // next's cookieStore exposes delete; fall back to set with maxAge=0 if needed
            if (typeof (cookieStore as any).delete === 'function') {
              ;(cookieStore as any).delete(name)
            } else {
              cookieStore.set(name, '', { path: '/', maxAge: 0 })
            }
          } catch (e) {
            // ignore
          }
        }
      } as any)
    }
  )
}

// Admin/service client that bypasses RLS for server-side queries that need
// to run with elevated privileges (do NOT export this to client-side code).
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in the environment')
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}