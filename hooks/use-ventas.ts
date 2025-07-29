"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Venta } from "@/lib/supabase"

export function useVentas() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchVentas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("ventas").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setVentas(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const agregarVenta = async (venta: Omit<Venta, "id" | "created_at" | "usuario_id" | "negocio_id">) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      // Obtener negocio_id del usuario
      const { data: userData } = await supabase.from("usuarios").select("negocio_id").eq("id", user.id).single()

      const { data, error } = await supabase
        .from("ventas")
        .insert([
          {
            ...venta,
            usuario_id: user.id,
            negocio_id: userData?.negocio_id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setVentas([data, ...ventas])

      // Actualizar stock de productos vendidos
      for (const item of venta.items) {
        await supabase.rpc("actualizar_stock", {
          producto_id: item.producto_id,
          cantidad_vendida: item.cantidad,
        })
      }

      toast({
        title: "Venta registrada",
        description: `Venta por $${venta.total} registrada correctamente`,
        variant: "success",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar la venta",
        variant: "destructive",
      })
      return false
    }
  }

  useEffect(() => {
    fetchVentas()
  }, [])

  return {
    ventas,
    loading,
    agregarVenta,
    refetch: fetchVentas,
  }
}
