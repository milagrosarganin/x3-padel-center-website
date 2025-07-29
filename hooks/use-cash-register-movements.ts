"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "./use-auth"

interface CashRegisterMovement {
  id: string
  user_id: string
  movement_type: "initial_balance" | "deposit" | "withdrawal" | "closing_balance"
  amount: number
  description: string | null
  movement_date: string
  created_at: string
}

export function useCashRegisterMovements() {
  const supabase = createClient()
  const { user } = useAuth()
  const [movements, setMovements] = useState<CashRegisterMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMovements = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from("cash_register_movements")
        .select("*")
        .eq("user_id", user.id)
        .order("movement_date", { ascending: false })

      if (fetchError) throw fetchError
      setMovements(data || [])
    } catch (err: any) {
      setError(err)
      console.error("Error fetching cash register movements:", err.message)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchMovements()
  }, [fetchMovements])

  const addMovement = async (
    newMovement: Omit<CashRegisterMovement, "id" | "user_id" | "movement_date" | "created_at">,
  ) => {
    if (!user) throw new Error("User not authenticated.")
    setLoading(true)
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from("cash_register_movements")
        .insert({ ...newMovement, user_id: user.id })
        .select()
        .single()

      if (insertError) throw insertError
      setMovements((prev) => [data, ...prev])
      return data
    } catch (err: any) {
      setError(err)
      console.error("Error adding cash register movement:", err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { movements, addMovement, loading, error, fetchMovements }
}
