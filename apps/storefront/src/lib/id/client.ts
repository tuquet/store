import { createBrowserClient } from "@supabase/ssr"

export function createIdBrowserClient() {
  const url = process.env.NEXT_PUBLIC_ID_URL || "http://127.0.0.1:55321"
  const anonKey = process.env.NEXT_PUBLIC_ID_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

  return createBrowserClient(url, anonKey)
}
