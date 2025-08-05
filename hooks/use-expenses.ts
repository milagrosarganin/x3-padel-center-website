"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

interface Expense {
  id: string
  user_id: string
  description: string
  amount: number
  fecha: string
  category: string | null
  created_at: string
}

export function useExpenses() {
  const supabase = createClient()
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from("gastos")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false })

      if (fetchError) throw fetchError
      setExpenses(data || [])
    } catch (err: any) {
      setError(err)
      console.error("Error fetching expenses:", err.message)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addExpense = async (newExpense: Omit<Expense, "id" | "user_id" | "fecha" | "created_at">) => {
    if (!user) throw new Error("User not authenticated.")
    setLoading(true)
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from("gastos")
        .insert({ ...newExpense, user_id: user.id })
        .select()
        .single()

      if (insertError) throw insertError
      setExpenses((prev) => [data, ...prev])
      return data
    } catch (err: any) {
      setError(err)
      console.error("Error adding expense:", err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { expenses, addExpense, loading, error, fetchExpenses }
}
