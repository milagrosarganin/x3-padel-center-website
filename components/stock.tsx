"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"
import { LoadingSpinner } from "./loading-spinner"
import { ExportButton } from "./export-button"

interface Producto {
  id: string
  nombre: string
  precio: number
  stock: number
  created_at: string
}

export function Stock() {
  const supabase = createClient()
  const { toast } = useToast()

  const [nombre, setNombre] = useState("")
  const [precio, setPrecio] = useState<number>(0)
  const [stock, setStock] = useState<number>(0)
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("productos").select("*").order("nombre", { ascending: true })

    if (error) {
      toast({
        title: "Error",
        description: `Error al cargar productos: ${error.message}`,
        variant: "destructive",
      })
    } else {
      setProductos(data || [])
    }
    setLoading(false)
  }

  const handleAddProducto = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { data, error } = await supabase.from("productos").insert({
      nombre,
      precio,
      stock,
    })

    if (error) {
      toast({
        title: "Error",
        description: `Error al agregar producto: ${error.message}`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Producto agregado correctamente.",
        variant: "default",
      })
      // Clear form and refetch
      setNombre("")
      setPrecio(0)
      setStock(0)
      fetchProductos()
    }
    setSubmitting(false)
  }

  const handleUpdateStock = async (id: string, newStock: number) => {
    setLoading(true)
    const { error } = await supabase.from("productos").update({ stock: newStock }).eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: `Error al actualizar stock: ${error.message}`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Stock actualizado correctamente.",
        variant: "default",
      })
      fetchProductos() // Re-fetch to get the latest data
    }
    setLoading(false)
  }

  const handleDeleteProducto = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return

    setLoading(true)
    const { error } = await supabase.from("productos").delete().eq("id", id)
    if (error) {
      toast({
        title: "Error",
        description: `Error al eliminar producto: ${error.message}`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente.",
        variant: "default",
      })
      fetchProductos()
    }
    setLoading(false)
  }

  const exportHeaders = [
    { key: "nombre", label: "Nombre" },
    { key: "precio", label: "Precio" },
    { key: "stock", label: "Stock" },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Nuevo Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddProducto} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-producto">Nombre</Label>
              <Input
                id="nombre-producto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del producto"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio-producto">Precio</Label>
              <Input
                id="precio-producto"
                type="number"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-producto">Stock Inicial</Label>
              <Input
                id="stock-producto"
                type="number"
                value={stock}
                onChange={(e) => setStock(Number.parseInt(e.target.value) || 0)}
                placeholder="0"
                required
              />
            </div>
            <Button type="submit" className="md:col-span-3" disabled={submitting}>
              {submitting ? <LoadingSpinner className="mr-2" /> : null}
              Agregar Producto
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Listado de Productos en Stock</CardTitle>
          <ExportButton data={productos} filename="stock_productos" headers={exportHeaders} />
        </CardHeader>
        <CardContent>
          {productos.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay productos registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell>{producto.nombre}</TableCell>
                      <TableCell>${producto.precio.toFixed(2)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={producto.stock}
                          onChange={(e) => handleUpdateStock(producto.id, Number.parseInt(e.target.value) || 0)}
                          className="w-24 text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProducto(producto.id)}>
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
