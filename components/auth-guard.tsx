"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth" // Import useAuth hook
import { LoadingSpinner } from "./loading-spinner"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth() // Use the hook to get user and loading state
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === "/login"

      if (user && isLoginPage) {
        // If user is logged in and tries to access login page, redirect to home
        router.push("/")
      } else if (!user && !isLoginPage) {
        // If user is not logged in and tries to access a protected page, redirect to login
        router.push("/login")
      }
    }
  }, [user, loading, router, pathname]) // Depend on user and loading from useAuth

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
