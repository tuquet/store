import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function createIdServerClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_ID_URL || "http://127.0.0.1:55321"
  const anonKey = process.env.NEXT_PUBLIC_ID_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  })
}

/**
 * Returns the currently authenticated user session from ID Platform (Supabase)
 */
export async function getIdUser() {
  const supabase = await createIdServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
