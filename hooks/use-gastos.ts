"use client"

import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { actualizarArqueoConGasto } from "@/hooks/use-arqueo" // (hay que crear esta función)

interface Gasto {
  id: string
  user_id: string
  fecha: string
  monto: number
  metodo_pago: string
  descripcion: string
  created_at: string
}

interface NuevoGasto {
  monto: number
  metodo_pago: string
  descripcion: string
}

export function useGastos() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(false)

  const registrarGasto = useCallback(async (gasto: NuevoGasto) => {
    if (!userId) return

    try {
      setLoading(true)

      const { error } = await supabase.from("movimientos_caja").insert([
        {
          user_id: userId,
          fecha: new Date().toISOString(),
          tipo: "egreso",
          amount: gasto.monto,
          descripcion: gasto.descripcion,
          metodo_pago: gasto.metodo_pago,
        },
      ])

      if (error) {
        console.error("Error al registrar gasto:", error)
        return
      }

      // ✅ Actualiza arqueo si hay uno abierto
      await actualizarArqueoConGasto(supabase, userId, gasto.metodo_pago, gasto.monto)
    } catch (err) {
      console.error("Error inesperado al registrar gasto:", err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  return {
    registrarGasto,
    loading,
  }
}
