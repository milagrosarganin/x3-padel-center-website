"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { useProductos } from "@/hooks/use-productos"

interface SaleItem {
  product_id: string
  quantity: number
  price_at_sale: number
}

interface Sale {
  id: string
  user_id: string
  fecha: string
  total: number
  metodo_pago: string | null
  origen: string | null
  created_at: string
  items?: SaleItem[]
  detalles: string | null
}

interface NewSalePayload {
  total: number
  metodo_pago: string | null
  origen: string | null
  items: SaleItem[]
}

export function useSales() {
  const supabase = createClient()
  const { user } = useAuth()
  const { fetchProductos, productos } = useProductos()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSales = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from("ventas")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false })

      if (fetchError) throw fetchError
      setSales(data || [])
    } catch (err: any) {
      setError(err)
      console.error("Error fetching sales:", err.message)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const addSale = async (newSale: NewSalePayload) => {
    if (!user) {
      const authError = new Error("Usuario no autenticado.")
      setError(authError)
      throw authError
    }
    setLoading(true)
    setError(null)

    try {
      const { data: saleData, error: saleError } = await supabase
        .from("ventas")
        .insert({
          user_id: user.id,
          total: newSale.total,
          metodo_pago: newSale.metodo_pago,
          origen: newSale.origen,
          fecha: new Date().toISOString(),
          detalles: JSON.stringify(
            newSale.items.map((item) => {
              const product = productos.find((p) => p.id === item.product_id)
              return {
                product_id: item.product_id,
                nombre: product?.nombre ?? "Desconocido",
                quantity: item.quantity,
                price_at_sale: item.price_at_sale,
              }
            })
          ),
        })
        .select()
        .single()

      if (saleError) {
        throw new Error(`Error al registrar la venta: ${saleError.message}`)
      }

      // Ya no insertamos en sale_items, guardamos todo en detalles (jsonb)

      const stockUpdatePromises = newSale.items.map((item) => {
        const product = productos.find((p) => p.id === item.product_id)
        const newStock = (product?.stock_actual ?? 0) - item.quantity
        return supabase.from("productos").update({ stock_actual: newStock }).eq("id", item.product_id)
      })

      const stockUpdateResults = await Promise.all(stockUpdatePromises)
      const stockUpdateError = stockUpdateResults.find((res) => res.error)
      if (stockUpdateError) throw new Error(`Fallo al actualizar stock: ${stockUpdateError.error?.message}`)

      await fetchSales()
      await fetchProductos()

      return saleData
    } catch (err: any) {
      console.error("Error completo al procesar la venta:", err)
      const errorMessage = err?.message || "Ocurrió un error inesperado al procesar la venta."
      setError(new Error(errorMessage))
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { sales, addSale, loading, error, fetchSales }
}
