import { createBrowserClient } from "@supabase/ssr"

// Ensure these are defined in your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("Supabase URL:", supabaseUrl ? "Configured" : "Not Configured")
console.log("Supabase Anon Key:", supabaseAnonKey ? "Configured" : "Not Configured")

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  )
  // In a real application, you might want to throw an error or handle this more gracefully
  // For now, we'll proceed but the client will likely fail.
}

// Singleton pattern for the Supabase client
let supabase: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase client cannot be created: Missing environment variables.")
    }
    // Correctly initialize the client using createBrowserClient
    supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log("Supabase client initialized.")
  }
  return supabase
}
