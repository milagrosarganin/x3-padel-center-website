"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { AuthSession, AuthUser, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from "@supabase/supabase-js"

interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  fetchUser: () => Promise<void>
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<any>
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<any>
  signOut: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error("Error getting session:", error)
    } else {
      setSession(data.session)
      setUser(data.session?.user ?? null)
    }
    setLoading(false)
  }

  useEffect(() => {
    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user,
    loading,
    fetchUser: getSession, // Añadimos la función al contexto
    signIn: (credentials: SignInWithPasswordCredentials) => supabase.auth.signInWithPassword(credentials),
    signUp: (credentials: SignUpWithPasswordCredentials) => supabase.auth.signUp(credentials),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}