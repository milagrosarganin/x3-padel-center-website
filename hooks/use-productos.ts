"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "./use-auth"

interface Producto {
  id: string
  nombre: string
  precio: number
  stock: number
  created_at: string
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
        description: fetchError.message,
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

  const addProducto = async (newProducto: Omit<Producto, "id" | "created_at">) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para agregar un producto.",
        variant: "destructive",
      })
      return
    }
    const { data, error: insertError } = await supabase.from("productos").insert({
      ...newProducto,
      user_id: user.id,
    })
    if (insertError) {
      toast({
        title: "Error al agregar producto",
        description: insertError.message,
        variant: "destructive",
      })
      return null
    } else {
      toast({
        title: "Producto agregado",
        description: "El producto ha sido guardado exitosamente.",
      })
      fetchProductos() // Refresh the list
      return data
    }
  }

  const updateProductoStock = async (id: string, newStock: number) => {
    const { error: updateError } = await supabase.from("productos").update({ stock: newStock }).eq("id", id)
    if (updateError) {
      toast({
        title: "Error al actualizar stock",
        description: updateError.message,
        variant: "destructive",
      })
      return false
    } else {
      toast({
        title: "Stock actualizado",
        description: "El stock del producto ha sido actualizado.",
      })
      fetchProductos() // Refresh the list
      return true
    }
  }

  const deleteProducto = async (id: string) => {
    const { error: deleteError } = await supabase.from("productos").delete().eq("id", id)
    if (deleteError) {
      toast({
        title: "Error al eliminar producto",
        description: deleteError.message,
        variant: "destructive",
      })
      return false
    } else {
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente.",
      })
      fetchProductos() // Refresh the list
      return true
    }
  }

  return { productos, loading, error, addProducto, updateProductoStock, deleteProducto, fetchProductos }
}
