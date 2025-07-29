"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Gasto } from "@/lib/supabase"

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchGastos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("gastos").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setGastos(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los gastos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const agregarGasto = async (gasto: Omit<Gasto, "id" | "created_at" | "usuario_id" | "negocio_id">) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      // Obtener negocio_id del usuario
      const { data: userData } = await supabase.from("usuarios").select("negocio_id").eq("id", user.id).single()

      const { data, error } = await supabase
        .from("gastos")
        .insert([
          {
            ...gasto,
            usuario_id: user.id,
            negocio_id: userData?.negocio_id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setGastos([data, ...gastos])
      toast({
        title: "Gasto registrado",
        description: `Gasto de $${gasto.monto} registrado correctamente`,
        variant: "success",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar el gasto",
        variant: "destructive",
      })
      return false
    }
  }

  const actualizarGasto = async (id: string, updates: Partial<Gasto>) => {
    try {
      const { data, error } = await supabase.from("gastos").update(updates).eq("id", id).select().single()

      if (error) throw error

      setGastos(gastos.map((g) => (g.id === id ? data : g)))
      toast({
        title: "Gasto actualizado",
        description: "Los cambios se guardaron correctamente",
        variant: "success",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el gasto",
        variant: "destructive",
      })
      return false
    }
  }

  const eliminarGasto = async (id: string) => {
    try {
      const { error } = await supabase.from("gastos").delete().eq("id", id)

      if (error) throw error

      setGastos(gastos.filter((g) => g.id !== id))
      toast({
        title: "Gasto eliminado",
        description: "El gasto se eliminó correctamente",
        variant: "success",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el gasto",
        variant: "destructive",
      })
      return false
    }
  }

  useEffect(() => {
    fetchGastos()
  }, [])

  return {
    gastos,
    loading,
    agregarGasto,
    actualizarGasto,
    eliminarGasto,
    refetch: fetchGastos,
  }
}
