"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth" // Import useAuth hook
import { LoadingSpinner } from "@/components/loading-spinner"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth() // Usa el hook para obtener el estado del usuario y la carga
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === "/login"

      if (user && isLoginPage) {
        // Si el usuario está logueado e intenta acceder a la página de login, redirige a home
        router.push("/")
      } else if (!user && !isLoginPage) {
        // Si el usuario NO está logueado e intenta acceder a una página protegida, redirige a login
        router.push("/login")
      }
    }
  }, [user, loading, router, pathname]) // Depende de user y loading de useAuth

  if (loading || (!user && pathname !== "/login")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <LoadingSpinner />
        <p className="ml-2 text-lg text-gray-700 dark:text-gray-300">
          {loading ? "Cargando..." : "Redirigiendo al login..."}
        </p>
      </div>
    )
  }

  return <>{children}</>
}
