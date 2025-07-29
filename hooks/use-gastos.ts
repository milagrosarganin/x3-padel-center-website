"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "./use-auth"

interface Gasto {
  id: string
  fecha: string
  monto: number
  descripcion: string
  categoria: string
  created_at: string
}

export function useGastos() {
  const supabase = createClient()
  const { user } = useAuth()
  const { toast } = useToast()

  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchGastos = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from("gastos")
      .select("*")
      .eq("user_id", user.id)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })

    if (fetchError) {
      setError(fetchError)
      toast({
        title: "Error al cargar gastos",
        description: fetchError.message,
        variant: "destructive",
      })
    } else {
      setGastos(data || [])
    }
    setLoading(false)
  }, [supabase, user, toast])

  useEffect(() => {
    fetchGastos()
  }, [fetchGastos])

  const addGasto = async (newGasto: Omit<Gasto, "id" | "created_at">) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para agregar un gasto.",
        variant: "destructive",
      })
      return
    }
    const { data, error: insertError } = await supabase.from("gastos").insert({
      ...newGasto,
      user_id: user.id,
    })
    if (insertError) {
      toast({
        title: "Error al agregar gasto",
        description: insertError.message,
        variant: "destructive",
      })
      return null
    } else {
      toast({
        title: "Gasto agregado",
        description: "El gasto ha sido guardado exitosamente.",
      })
      fetchGastos() // Refresh the list
      return data
    }
  }

  const deleteGasto = async (id: string) => {
    const { error: deleteError } = await supabase.from("gastos").delete().eq("id", id)
    if (deleteError) {
      toast({
        title: "Error al eliminar gasto",
        description: deleteError.message,
        variant: "destructive",
      })
      return false
    } else {
      toast({
        title: "Gasto eliminado",
        description: "El gasto ha sido eliminado exitosamente.",
      })
      fetchGastos() // Refresh the list
      return true
    }
  }

  return { gastos, loading, error, addGasto, deleteGasto, fetchGastos }
}
