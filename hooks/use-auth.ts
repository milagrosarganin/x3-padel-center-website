"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Error de autenticación",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Bienvenido",
        description: "Has iniciado sesión correctamente",
        variant: "success",
      })

      router.push("/")
      return true
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, nombre: string, nombreNegocio: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            nombre_negocio: nombreNegocio, // Pasar el nombre del negocio en los metadatos
          },
        },
      })

      if (error) {
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Registro exitoso",
        description: "Revisa tu email para confirmar tu cuenta",
        variant: "success",
      })

      return true
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
        variant: "success",
      })

      router.push("/login")
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }
}
