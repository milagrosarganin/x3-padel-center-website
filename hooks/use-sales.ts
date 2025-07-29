"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "./use-auth"
import { useProducts } from "./use-products" // Import useProducts to refresh stock

interface SaleItem {
  product_id: string
  quantity: number
  price_at_sale: number
}

interface Sale {
  id: string
  user_id: string
  sale_date: string
  total_amount: number
  payment_method: string | null
  created_at: string
  items?: SaleItem[] // Optional, for when fetching details
}

export function useSales() {
  const supabase = createClient()
  const { user } = useAuth()
  const { fetchProducts } = useProducts() // Get fetchProducts from useProducts
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
        .from("sales")
        .select("*")
        .eq("user_id", user.id)
        .order("sale_date", { ascending: false })

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

  const addSale = async (
    newSale: Omit<Sale, "id" | "user_id" | "sale_date" | "created_at"> & { items: SaleItem[] },
  ) => {
    if (!user) throw new Error("User not authenticated.")
    setLoading(true)
    setError(null)
    try {
      // Start a transaction if Supabase supports it directly, or handle sequentially
      // For simplicity, we'll do it sequentially and rely on RLS and triggers for integrity

      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          user_id: user.id,
          total_amount: newSale.total_amount,
          payment_method: newSale.payment_method,
        })
        .select()
        .single()

      if (saleError) throw saleError

      const saleId = saleData.id

      // Insert sale items
      const saleItemsToInsert = newSale.items.map((item) => ({
        sale_id: saleId,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_sale: item.price_at_sale,
      }))

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItemsToInsert)

      if (itemsError) throw itemsError

      // Re-fetch sales to update the list
      await fetchSales()
      // Re-fetch products to update stock display
      await fetchProducts()

      return saleData
    } catch (err: any) {
      setError(err)
      console.error("Error adding sale:", err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { sales, addSale, loading, error, fetchSales }
}
