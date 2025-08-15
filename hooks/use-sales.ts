"use client"

import { useCallback, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { actualizarArqueoConVenta } from "@/hooks/use-arqueo"

export type MetodoPago = "Efectivo" | "Transferencia" | "QR" | "Tarjeta" | "Cuenta" | "Descuento";

export interface NewSaleItem {
  product_id: string
  quantity: number
  price_at_sale: number
}

export interface NewSalePayload {
  total: number
  metodo_pago: MetodoPago
  origen?: "Mostrador" | "Turnos" | "Torneos" | "Gastro"
  mesa_id?: string | null
  items: NewSaleItem[]
}

export function useSales() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const addSale = useCallback(async (venta: NewSalePayload) => {
    if (!userId) {
      throw new Error("No hay usuario logueado para registrar la venta")
    }

    setLoading(true)
    setError(null)

    try {
      // La función `procesar_venta` en la base de datos se encarga de toda la lógica de forma atómica:
      // 1. Crea la venta.
      // 2. Inserta los detalles de la venta.
      // 3. Actualiza el stock de los productos.
      // 4. Actualiza el arqueo de caja.
      // Si algo falla, toda la transacción se revierte.
      const { data, error: rpcError } = await supabase.rpc("procesar_venta", {
        p_user_id: userId,
        p_total: venta.total,
        p_metodo_pago: venta.metodo_pago,
        p_origen: venta.origen ?? null,
        p_mesa_id: venta.mesa_id ?? null,
        p_items: venta.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_sale: item.price_at_sale,
        })),
      })

      if (rpcError) {
        // El error de la función de base de datos será mucho más específico.
        // Por ejemplo, si falla una restricción de clave foránea o un trigger.
        throw rpcError
      }
      console.log("Venta procesada exitosamente.")
    } catch (err: any) {
      setError(err)
      console.error("Error inesperado al registrar la venta:", err)
      throw err // Relanzamos el error para que el componente lo pueda capturar
    } finally {
      setLoading(false)
    }
  }, [userId])

  return {
    addSale, loading, error
  }
}
