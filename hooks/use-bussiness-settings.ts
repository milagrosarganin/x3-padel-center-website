"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

interface BusinessSettings {
  id: string
  user_id: string
  business_name: string | null
  tax_rate: number
  currency_symbol: string
  enable_stock_tracking: boolean
  created_at: string
  updated_at: string
}

export function useBusinessSettings() {
  const supabase = createClient()
  const { user } = useAuth()

  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSettings = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("business_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (fetchError) throw fetchError
      setSettings(data)
    } catch (err: any) {
      setError(err)
      console.error("Error fetching business settings:", err.message)
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    if (!user || !settings?.id) return false

    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from("business_settings")
        .update({ ...newSettings, updated_at: new Date().toISOString() })
        .eq("id", settings.id)
        .select()
        .single()

      if (updateError) throw updateError

      setSettings(data)
      return true
    } catch (err: any) {
      setError(err)
      console.error("Error updating business settings:", err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return { settings, updateSettings, loading, error, fetchSettings }
}
