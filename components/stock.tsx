"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useProducts } from "@/hooks/use-products"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "./loading-spinner"

export function Stock() {
  const { products, addProduct, updateProduct, loading, error } = useProducts()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  const handleEdit = (product: (typeof products)[0]) => {
    setEditingProductId(product.id)
    setName(product.name)
    setDescription(product.description || "")
    setPrice(product.price.toString())
    setStock(product.stock.toString())
  }

  const handleCancelEdit = () => {
    setEditingProductId(null)
    setName("")
    setDescription("")
    setPrice("")
    setStock("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !stock) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    const parsedPrice = Number.parseFloat(price)
    const parsedStock = Number.parseInt(stock)

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser un número positivo.",
        variant: "destructive",
      })
      return
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      toast({
        title: "Error",
        description: "El stock debe ser un número entero no negativo.",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, {
          name,
          description: description || null,
          price: parsedPrice,
          stock: parsedStock,
        })
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado exitosamente.",
        })
      } else {
        await addProduct({
          name,
          description: description || null,
          price: parsedPrice,
          stock: parsedStock,
        })
        toast({
          title: "Producto registrado",
          description: "El producto se ha registrado exitosamente.",
        })
      }
      handleCancelEdit() // Clear form and exit edit mode
    } catch (err: any) {
      toast({
        title: `Error al ${editingProductId ? "actualizar" : "registrar"} producto`,
        description: err.message || "Ocurrió un error inesperado.",
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
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              placeholder="Nombre del producto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descripción del producto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="w-full md:w-auto">
            {editingProductId ? "Actualizar Producto" : "Registrar Producto"}
          </Button>
          {editingProductId && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              className="w-full md:w-auto bg-transparent"
            >
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
              <TableHead>Descripción</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No hay productos registrados.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description || "-"}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      Editar
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
