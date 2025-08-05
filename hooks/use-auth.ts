"use client"

import { useAuthContext } from "@/auth-context"

export function useAuth() {
  // Este hook ahora simplemente consume el contexto.
  // Mantiene la misma interfaz, por lo que no necesitas cambiar nada en tus componentes.
  return useAuthContext()
}
