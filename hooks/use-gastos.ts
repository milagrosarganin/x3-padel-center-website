"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

interface CashRegisterMovement {
  id: string
  user_id: string
  fecha: string
  saldo_inicial: number
  saldo_final: number
  diferencia: number
  ventas_efectiv: number
  ventas_tarjeta: number
  ventas_transfer: number
  ventas_otro: number
  gastos_efectiv: number
  gastos_tarjeta: number
  gastos_transfer: number
  gastos_otro: number
  comentarios: string
  created_at: string
}

export function useCashRegisterMovements() {
  const supabase = createClient()
  const { user } = useAuth()
  const [movements, setMovements] = useState<CashRegisterMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMovements = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("arqueo_caja")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false })

      if (fetchError) throw fetchError
      setMovements(data || [])
    } catch (err: any) {
      setError(err)
      console.error("Error al cargar arqueos:", err.message)
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    fetchMovements()
  }, [fetchMovements])

  const addMovement = async (
    newMovement: Omit<CashRegisterMovement, "id" | "user_id" | "fecha" | "created_at">
  ) => {
    if (!user) throw new Error("Usuario no autenticado.")
    setLoading(true)
    setError(null)

    try {
      const today = new Date().toISOString().split("T")[0]

      // 1. Buscar ventas del día
      const { data: ventas, error: ventasError } = await supabase
        .from("ventas")
        .select("*")
        .eq("user_id", user.id)
        .eq("fecha", today)

      if (ventasError) throw ventasError

      const ventas_efectiv = sumarPorMetodo(ventas, "cash")
      const ventas_tarjeta = sumarPorMetodo(ventas, "card")
      const ventas_transfer = sumarPorMetodo(ventas, "transfer")
      const ventas_otro = sumarPorMetodo(ventas, "other")

      // 2. Buscar gastos del día
      const { data: gastos, error: gastosError } = await supabase
        .from("gastos")
        .select("*")
        .eq("user_id", user.id)
        .eq("fecha", today)

      if (gastosError) throw gastosError

      const gastos_efectiv = sumarPorMetodo(gastos, "cash")
      const gastos_tarjeta = sumarPorMetodo(gastos, "card")
      const gastos_transfer = sumarPorMetodo(gastos, "transfer")
      const gastos_otro = sumarPorMetodo(gastos, "other")

      // 3. Insertar movimiento con ventas y gastos agrupados
      const { data, error: insertError } = await supabase
        .from("arqueo_caja")
        .insert({
          ...newMovement,
          user_id: user.id,
          fecha: today,
          ventas_efectiv,
          ventas_tarjeta,
          ventas_transfer,
          ventas_otro,
          gastos_efectiv,
          gastos_tarjeta,
          gastos_transfer,
          gastos_otro,
        })
        .select()
        .single()

      if (insertError) throw insertError

      setMovements((prev) => [data, ...prev])
      return data
    } catch (err: any) {
      setError(err)
      console.error("Error al cerrar caja:", err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    movements,
    loading,
    error,
    fetchMovements,
    addMovement,
  }
}

// Función auxiliar
function sumarPorMetodo(arr: any[], metodo: string): number {
  return arr
    .filter((item) => item.metodo_pago === metodo)
    .reduce((sum, item) => sum + (item.total || item.monto || 0), 0)
}