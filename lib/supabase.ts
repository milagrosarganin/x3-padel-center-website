import { createBrowserClient } from "@supabase/ssr"

// Asegúrate de que estas variables estén definidas en tus variables de entorno de Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Estos logs son CRUCIALES para depurar en Vercel.
// Revísalos en los logs de tu despliegue en Vercel.
console.log("Supabase URL:", supabaseUrl ? "Configurada" : "NO CONFIGURADA")
console.log("Supabase Anon Key:", supabaseAnonKey ? "Configurada" : "NO CONFIGURADA")

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "¡ERROR CRÍTICO! Faltan variables de entorno de Supabase. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.",
  )
  // En una aplicación real, podrías querer lanzar un error o manejar esto de forma más elegante.
  // Por ahora, continuaremos, pero el cliente probablemente fallará.
}

// Patrón Singleton para el cliente de Supabase
let supabase: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      // Si las variables no están disponibles aquí, significa que no se configuraron correctamente
      // o que hay un problema en el entorno de ejecución.
      throw new Error("El cliente de Supabase no puede ser creado: Faltan variables de entorno.")
    }
    // Inicializa correctamente el cliente usando createBrowserClient
    supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log("Cliente de Supabase inicializado.")
  }
  return supabase
}
