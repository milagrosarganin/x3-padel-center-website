import { createBrowserClient } from "@supabase/ssr"

// Esta función se asegura de que las variables de entorno existan.
// Se llamará una sola vez.
function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan las variables de entorno de Supabase: NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }
  return { supabaseUrl, supabaseAnonKey }
}

// Creamos el cliente una sola vez y lo exportamos.
// Esto es más eficiente que el patrón Singleton con una función.
const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Para mantener la compatibilidad con tu código existente que usa `createClient()`,
// podemos exportar una función que simplemente devuelve el cliente ya creado.
export function createClient() {
  return supabase
}
