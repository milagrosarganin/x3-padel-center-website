"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Producto } from "@/lib/supabase"

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchProductos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("productos").select("*").order("nombre")

      if (error) throw error

      setProductos(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const agregarProducto = async (
    producto: Omit<Producto, "id" | "created_at" | "updated_at" | "usuario_id" | "negocio_id">,
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      // Obtener negocio_id del usuario
      const { data: userData } = await supabase.from("usuarios").select("negocio_id").eq("id", user.id).single()

      const { data, error } = await supabase
        .from("productos")
        .insert([
          {
            ...producto,
            usuario_id: user.id,
            negocio_id: userData?.negocio_id,
            ultima_compra: new Date().toISOString().split("T")[0],
          },
        ])
        .select()
        .single()

      if (error) throw error

      setProductos([...productos, data])
      toast({
        title: "Producto agregado",
        description: `${producto.nombre} se agregó correctamente`,
        variant: "success",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el producto",
        variant: "destructive",
      })
      return false
    }
  }

  const actualizarProducto = async (id: string, updates: Partial<Producto>) => {
    try {
      const { data, error } = await supabase
        .from("productos")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      setProductos(productos.map((p) => (p.id === id ? data : p)))
      toast({
        title: "Producto actualizado",
        description: "Los cambios se guardaron correctamente",
        variant: "success",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el producto",
        variant: "destructive",
      })
      return false
    }
  }

  const eliminarProducto = async (id: string) => {
    try {
      const { error } = await supabase.from("productos").delete().eq("id", id)

      if (error) throw error

      setProductos(productos.filter((p) => p.id !== id))
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó correctamente",
        variant: "success",
      })

      return true
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el producto",
        variant: "destructive",
      })
      return false
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  return {
    productos,
    loading,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    refetch: fetchProductos,
  }
}
