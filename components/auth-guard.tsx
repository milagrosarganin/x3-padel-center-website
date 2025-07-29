"use client"

import type React from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/loading-spinner"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirigir al login si no hay usuario autenticado
    // Esto se maneja en useAuth, pero aquí aseguramos que no se renderice el contenido protegido
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
