"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "./use-auth"

interface Supplier {
  id: string
  user_id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  created_at: string
}

export function useSuppliers() {
  const supabase = createClient()
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSuppliers = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true })

      if (fetchError) throw fetchError
      setSuppliers(data || [])
    } catch (err: any) {
      setError(err)
      console.error("Error fetching suppliers:", err.message)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const addSupplier = async (newSupplier: Omit<Supplier, "id" | "user_id" | "created_at">) => {
    if (!user) throw new Error("User not authenticated.")
    setLoading(true)
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from("suppliers")
        .insert({ ...newSupplier, user_id: user.id })
        .select()
        .single()

      if (insertError) throw insertError
      setSuppliers((prev) => [data, ...prev])
      return data
    } catch (err: any) {
      setError(err)
      console.error("Error adding supplier:", err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { suppliers, addSupplier, loading, error, fetchSuppliers }
}
