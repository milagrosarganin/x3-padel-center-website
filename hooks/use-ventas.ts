"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "./use-auth"

interface VentaItem {
  producto_id: string
  nombre: string
  cantidad: number
  precio_unitario: number
}

interface Venta {
  id: string
  fecha: string
  total: number
  metodo_pago: string
  detalles: VentaItem[]
  created_at: string
}

export function useVentas() {
  const supabase = createClient()
  const { user } = useAuth()
  const { toast } = useToast()

  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchVentas = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from("ventas")
      .select("*")
      .eq("user_id", user.id)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })

    if (fetchError) {
      setError(fetchError)
      toast({
        title: "Error al cargar ventas",
        description: fetchError.message,
        variant: "destructive",
      })
    } else {
      setVentas(data || [])
    }
    setLoading(false)
  }, [supabase, user, toast])

  useEffect(() => {
    fetchVentas()
  }, [fetchVentas])

  const addVenta = async (newVenta: Omit<Venta, "id" | "created_at">) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para registrar una venta.",
        variant: "destructive",
      })
      return
    }
    const { data, error: insertError } = await supabase.from("ventas").insert({
      ...newVenta,
      user_id: user.id,
    })
    if (insertError) {
      toast({
        title: "Error al registrar venta",
        description: insertError.message,
        variant: "destructive",
      })
      return null
    } else {
      toast({
        title: "Venta registrada",
        description: "La venta ha sido guardada exitosamente.",
      })
      fetchVentas() // Refresh the list
      return data
    }
  }

  const deleteVenta = async (id: string) => {
    const { error: deleteError } = await supabase.from("ventas").delete().eq("id", id)
    if (deleteError) {
      toast({
        title: "Error al eliminar venta",
        description: deleteError.message,
        variant: "destructive",
      })
      return false
    } else {
      toast({
        title: "Venta eliminada",
        description: "La venta ha sido eliminada exitosamente.",
      })
      fetchVentas() // Refresh the list
      return true
    }
  }

  return { ventas, loading, error, addVenta, deleteVenta, fetchVentas }
}
