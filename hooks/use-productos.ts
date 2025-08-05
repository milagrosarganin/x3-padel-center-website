"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Proveedores } from "@/components/proveedores"

export interface Producto {
  id: string
  user_id: string
  nombre: string
  codigo_barras?: string
  precio_venta: number
  precio_costo: number
  stock_actual: number
  stock_minimo?: number
  categoria?: string
  proveedores?: string
  created_at: string
  updated_at: string
}


export function useProductos() {
  const supabase = createClient()
  const { user } = useAuth()
  const { toast } = useToast()

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProductos = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from("productos")
      .select("*")
      .eq("user_id", user.id)
      .order("nombre", { ascending: true })

    if (fetchError) {
      setError(fetchError)
      toast({
        title: "Error al cargar productos",
        variant: "destructive",
      })
    } else {
      setProductos(data || [])
    }

    setLoading(false)
  }, [supabase, user, toast])

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

    const addProducto = async (
    newProducto: {
      nombre: string
      precio_venta: number
      precio_costo: number
      stock_actual: number
      categoria?: string
      proveedores?: string
    }
  ) => {
    if (!user) {
      toast({
        title: "Error: Debes iniciar sesión para agregar un producto.",
        variant: "destructive",
      })
      return
    }

    const { data, error: insertError } = await supabase.from("productos").insert([{
      user_id: user.id,
      nombre: newProducto.nombre,
      precio_venta: newProducto.precio_venta,         // O podés renombrar a precio_venta directamente
      precio_costo: newProducto.precio_costo,   // ✅ Campo nuevo
      stock_actual: newProducto.stock_actual,
      categoria: newProducto.categoria,
      proveedores: newProducto.proveedores,
    }])

    if (insertError) {
      throw insertError
    }

    await fetchProductos()
    return data
  }


  const updateProductoStock = async (id: string, newStock: number) => {
    const { error: updateError } = await supabase
      .from("productos")
      .update({ stock_actual: newStock })
      .eq("id", id)

    if (updateError) {
      throw updateError
    }

    await fetchProductos()
    return true
  }

  const deleteProducto = async (id: string) => {
    const { error: deleteError } = await supabase
      .from("productos")
      .delete()
      .eq("id", id)

    if (deleteError) {
      throw deleteError
    }

    await fetchProductos()
    return true
  }

    const updateProducto = async (
    id: string,
    updated: {
      nombre: string
      precio_venta: number
      precio_costo: number
      stock_actual: number
      categoria?: string
      proveedores?: string
    }
  ) => {
    const { error: updateError } = await supabase
      .from("productos")
      .update({
        nombre: updated.nombre,
        precio_venta: updated.precio_venta,
        precio_costo: updated.precio_costo,
        stock_actual: updated.stock_actual,
        categoria: updated.categoria,
        proveedores: updated.proveedores,
      })
      .eq("id", id)

    if (updateError) {
      throw updateError
    }

    await fetchProductos()
    return true
  }


  return {
    productos,
    loading,
    error,
    addProducto,
    updateProductoStock,
    deleteProducto,
    fetchProductos,
    updateProducto,
  }
}
