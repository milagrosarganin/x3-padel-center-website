"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js" // Import AuthChangeEvent and Session types

export function useAuth() {
  console.log("useAuth hook inicializado.")
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    console.log("fetchUser: Iniciando la obtención del usuario.")
    setLoading(true)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) {
      console.error("Error al obtener el usuario:", error.message)
      setUser(null)
    } else {
      setUser(user)
    }
    console.log("fetchUser: Datos del usuario:", user)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    console.log("Llamando a fetchUser al montar el componente.")
    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, newSession: Session | null) => {
      console.log("Evento de cambio de estado de autenticación:", event, "Sesión:", newSession)
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUser(newSession?.user || null)
        console.log("Cambio de estado de autenticación: Usuario actualizado a", newSession?.user || null)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        console.log("Cambio de estado de autenticación: Usuario actualizado a", null)
      }
      setLoading(false)
    })

    return () => {
      console.log("Desuscribiendo del listener de autenticación.")
      subscription?.unsubscribe()
    }
  }, [fetchUser, supabase.auth])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (data.user) {
      setUser(data.user)
    }
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName: string, businessName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          business_name: businessName,
        },
      },
    })
    if (data.user) {
      setUser(data.user)
    }
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
    }
    return { error }
  }

  return { user, loading, signIn, signUp, signOut, fetchUser }
}
