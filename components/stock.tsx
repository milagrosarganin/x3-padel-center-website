"use client"

import type React from "react"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useProductos } from "@/hooks/use-productos"
import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth" // ⚠️ Asegurate de importar tu hook de autenticación
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"

export function Stock() {
  const {
    productos,
    addProducto,
    updateProducto,
    deleteProducto,
    loading,
    error,
    
  } = useProductos()
  const { toast } = useToast()

  // State for the form
  const [nombre, setNombre] = useState("")
  const [precioVenta, setPrecioVenta] = useState("")
  const [precioCosto, setPrecioCosto] = useState("")
  const [stockActual, setStockActual] = useState("")
  const [categoria, setCategoria] = useState("")
  const [proveedores, setProveedores] = useState("")
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const { user } = useAuth()

useEffect(() => {console.log("🪪 Usuario autenticado:", user?.id)}, [user])


  // Helper para parsear números y manejar la coma como separador decimal
  const parseLocaleNumber = (stringNumber: string) => {
    if (typeof stringNumber !== "string") return NaN
    const sanitizedString = stringNumber.replace(",", ".")
    return parseFloat(sanitizedString)
  }
  const handleDelete = async (productId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) return
    try {
      await deleteProducto(productId)
      toast({
        title: "Producto eliminado",

        content: "El producto se ha eliminado exitosamente.",
      })
    } catch (err: any) {
      toast({
        title: "Error al eliminar",
        content: err.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingProductId(null)
    setNombre("")
    setPrecioVenta("")
    setPrecioCosto("")
    setStockActual("")
    setCategoria("")
    setProveedores("")
  }

  const handleEdit = (product: (typeof productos)[0]) => {
    setEditingProductId(product.id)
    setNombre(product.nombre)
    setPrecioVenta(product.precio_venta.toString())
    setPrecioCosto(product.precio_costo.toString())
    setStockActual(product.stock_actual.toString())
    setCategoria(product.categoria || "")
    setProveedores(product.proveedores || "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedPrecioVenta = parseLocaleNumber(precioVenta)
    const parsedPrecioCosto = parseLocaleNumber(precioCosto)
    const parsedStock = parseInt(stockActual, 10)

    if (
      !nombre ||
      isNaN(parsedPrecioVenta) ||
      parsedPrecioVenta <= 0 ||
      isNaN(parsedStock) ||
      parsedStock < 0 ||
      isNaN(parsedPrecioCosto) ||
      parsedPrecioCosto < 0
    ) {
      toast({
        title: "Error",
        description: "Completa todos los campos correctamente.",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingProductId) {
        await updateProducto(editingProductId, {
          nombre: nombre,
          precio_venta: parsedPrecioVenta,
          precio_costo: parsedPrecioCosto,
          stock_actual: parsedStock,
          categoria,
          proveedores,
        })
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado exitosamente.",
        })
      } else {
        await addProducto({
          nombre: nombre,
          precio_venta: parsedPrecioVenta,
          precio_costo: parsedPrecioCosto,
          stock_actual: parsedStock,
          categoria,
          proveedores,
        })
        toast({
          title: "Producto registrado",
          content: "El producto se ha registrado exitosamente.",
        })
      }
      resetForm()
    } catch (err: any) {
      toast({
        title: `Error al ${editingProductId ? "actualizar" : "registrar"} producto`,
        content: err.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="ml-2">Cargando stock...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        <p>Error al cargar stock: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">{editingProductId ? "Editar Producto" : "Registrar Nuevo Producto"}</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nombre">Nombre del Producto</Label>
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precioVenta">Precio de Venta</Label>
            <Input id="precioVenta" type="number" step="0.01" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precioCosto">Precio de Costo</Label>
            <Input id="precioCosto" type="number" step="0.01" value={precioCosto} onChange={(e) => setPrecioCosto(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" type="number" min="0" value={stockActual} onChange={(e) => setStockActual(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Input id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proveedores">Proveedor</Label>
            <Input id="proveedores" value={proveedores} onChange={(e) => setProveedores(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="w-full md:w-auto">
            {editingProductId ? "Actualizar Producto" : "Registrar Producto"}
          </Button>

          {editingProductId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="rounded-lg border shadow-sm">
        <h3 className="p-4 text-lg font-semibold">Listado de Productos</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio Venta</TableHead>
              <TableHead>Precio Costo</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No hay productos registrados.
                </TableCell>
              </TableRow>
            ) : (
              productos.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.nombre}</TableCell>
                  <TableCell>${product.precio_venta.toFixed(2)}</TableCell>
                  <TableCell>${product.precio_costo.toFixed(2)}</TableCell>
                  <TableCell>{product.stock_actual}</TableCell>
                  <TableCell>{product.categoria || "-"}</TableCell>
                  <TableCell>{product.proveedores || "-"}</TableCell>
                  <TableCell className="flex gap-2 whitespace-nowrap">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
