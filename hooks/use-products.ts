"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "./use-auth"

interface Product {
  id: string
  user_id: string
  name: string
  description: string | null
  price: number
  stock: number
  created_at: string
}

export function useProducts() {
  const supabase = createClient()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true })

      if (fetchError) throw fetchError
      setProducts(data || [])
    } catch (err: any) {
      setError(err)
      console.error("Error fetching products:", err.message)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const addProduct = async (newProduct: Omit<Product, "id" | "user_id" | "created_at">) => {
    if (!user) throw new Error("User not authenticated.")
    setLoading(true)
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from("products")
        .insert({ ...newProduct, user_id: user.id })
        .select()
        .single()

      if (insertError) throw insertError
      setProducts((prev) => [data, ...prev])
      return data
    } catch (err: any) {
      setError(err)
      console.error("Error adding product:", err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProduct = async (id: string, updates: Partial<Omit<Product, "id" | "user_id" | "created_at">>) => {
    if (!user) throw new Error("User not authenticated.")
    setLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (updateError) throw updateError
      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)))
      return data
    } catch (err: any) {
      setError(err)
      console.error("Error updating product:", err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { products, addProduct, updateProduct, loading, error, fetchProducts }
}
