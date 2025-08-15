"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

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

  const fetchSuppliersCallback = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('proveedores')
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true })

      if (fetchError) throw fetchError
      setSuppliers(data || [])
    } catch (err: any) {
      setError(new Error(`Error al obtener proveedores: ${err.message}`))
      console.error("Error fetching suppliers:", err.message)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchSuppliersCallback()
  }, [fetchSuppliersCallback])

  const addSupplier = async (
    newSupplier: Omit<Supplier, "id" | "user_id" | "created_at">
  ): Promise<Supplier | null> => {
    if (!user) throw new Error("Usuario no autenticado.")
    setLoading(true)
    setError(null)
    try {
      const { data: inserted, error: insertError } = await supabase
        .from('proveedores')
        .insert({ ...newSupplier, user_id: user.id })
        .select()
        .single()

      if (insertError) throw insertError
      setSuppliers((prev) =>
        [...prev, inserted].sort((a, b) => a.name.localeCompare(b.name))
      )
      return inserted
    } catch (err: any) {
      setError(err)
      console.error("Error adding supplier:", err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateSupplier = async (
    id: string,
    updates: Partial<Omit<Supplier, "id" | "user_id" | "created_at">>
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const { error: updateError } = await supabase
        .from('proveedores')
        .update(updates)
        .eq("id", id)

      if (updateError) {
        setError(updateError)
        return false
      } else {
        await fetchSuppliersCallback()
        return true
      }
    } catch (err: any) {
      setError(err)
      console.error("Error updating supplier:", err.message)
      return false
    } finally {
      await fetchSuppliersCallback()
      return true
    }
  }

  const deleteSupplier = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('proveedores')
      .delete()
      .eq("id", id)

    if (deleteError) {
      throw deleteError
    } else {
      // Volvemos a cargar los proveedores para asegurar que la lista esté actualizada.
      // Es más seguro que modificar el estado localmente.
      await fetchSuppliersCallback()
      return true
    }
  }

  return {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    loading,
    error,
    fetchSuppliers: fetchSuppliersCallback
  }
}
