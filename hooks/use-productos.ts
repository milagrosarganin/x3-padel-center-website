"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase" // Asumiendo consistencia con otros hooks
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export interface Producto {
  id: string
  user_id: string
  nombre: string
  codigo_barras?: string
  precio_venta: number
  precio_costo: number
  stock_actual: number
  stock_minimo: number
  categoria: string
  proveedor: string
  created_at: string
  updated_at: string
}

export type NuevoProducto = Omit<
  Producto,
  "id" | "user_id" | "created_at" | "updated_at"
>

export type ProductoActualizado = Partial<NuevoProducto>

export function useProductos() {
  // Inconsistencia: Algunos hooks usan createClient() y otros importan supabase directamente.
  // Estandarizar a uno. Usaré la importación directa para ser consistente con use-mesas.
  // const supabase = createClient()

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

    try {
      const { data, error: fetchError } = await supabase
        .from("productos")
        .select("*")
        .eq("user_id", user.id)
        .order("nombre", { ascending: true })

      if (fetchError) throw fetchError

      setProductos(data || [])
    } catch (err: any) {
      setError(err)
      console.error("Error al cargar productos:", err.message)
      // Dejar que el componente decida si mostrar un toast
    } finally {
      setLoading(false)
    }
  }, [user]) // supabase y toast no son dependencias si se definen fuera o no cambian.

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  const addProducto = async (newProducto: NuevoProducto) => {
    if (!user) throw new Error("Usuario no autenticado.")

    setLoading(true)
    try {
      const { data, error: insertError } = await supabase
        .from("productos")
        .insert({ ...newProducto, user_id: user.id })
        .select()
        .single()

      if (insertError) throw insertError

      // Actualizar estado local en lugar de refetch
      setProductos((prev) => [data, ...prev])
      return data
    } catch (err: any) {
      setError(err)
      console.error("Error al agregar producto:", err.message)
      throw err // Relanzar para que el componente lo maneje
    } finally {
      setLoading(false)
    }
  }

  const updateProducto = async (id: string, updated: ProductoActualizado) => {
    if (!user) throw new Error("Usuario no autenticado.")

    setLoading(true)
    try {
      const { data, error: updateError } = await supabase
        .from("productos")
        .update({ ...updated, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Actualizar estado local
      setProductos((prev) => prev.map((p) => (p.id === id ? data : p)))
      return data
    } catch (err: any) {
      setError(err)
      console.error("Error al actualizar producto:", err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProductoStock = async (id: string, newStock: number) => {
    // Esta función es un caso específico de updateProducto.
    // Se puede mantener por conveniencia o eliminarla y usar updateProducto.
    return updateProducto(id, { stock_actual: newStock })
  }

  const deleteProducto = async (id: string) => {
    if (!user) throw new Error("Usuario no autenticado.")

    setLoading(true)
    try {
      const { error: deleteError } = await supabase
        .from("productos")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (deleteError) throw deleteError

      // Actualizar estado local
      setProductos((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      setError(err)
      console.error("Error al eliminar producto:", err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    productos,
    loading,
    error,
    addProducto,
    updateProducto,
    updateProductoStock,
    deleteProducto,
    fetchProductos,
  }
}
