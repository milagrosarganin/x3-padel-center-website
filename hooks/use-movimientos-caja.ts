"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

export type MovementType = "initial_balance" | "deposit" | "withdrawal" | "closing_balance"

export interface MovimientoCaja {
  id: string
  user_id: string
  fecha: string
  tipo: MovementType
  amount: number
  descripcion: string | null
  created_at: string
}

interface NewMovimientoPayload {
  movement_type: MovementType
  amount: number
  description: string | null
}

export function useMovimientosCaja() {
  const supabase = createClient()
  const { user } = useAuth()
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMovimientos = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from("movimientos_caja")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false })

      if (fetchError) throw fetchError
      setMovimientos(data || [])
    } catch (err: any) {
      setError(err)
      console.error("Error al cargar movimientos de caja:", err.message)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchMovimientos()
  }, [fetchMovimientos])

  const addMovimiento = async (newMovimiento: NewMovimientoPayload) => {
    if (!user) throw new Error("Usuario no autenticado.")

    try {
      const { data, error: insertError } = await supabase
        .from("movimientos_caja")
        .insert({
          ...newMovimiento,
          user_id: user.id,
          fecha: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) throw insertError

      await fetchMovimientos()
      return data
    } catch (err: any) {
      console.error("Error al agregar movimiento:", err.message)
      throw err
    }
  }

  return {
    movimientos,
    addMovimiento,
    loading,
    error,
    fetchMovimientos,
  }
}