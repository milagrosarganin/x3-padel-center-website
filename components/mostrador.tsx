"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"
import { LoadingSpinner } from "./loading-spinner"
import { format } from "date-fns"

interface Producto {
  id: string
  nombre: string
  precio: number
  stock: number
}

interface VentaItem {
  producto_id: string
  nombre: string
  cantidad: number
  precio_unitario: number
}

const METODOS_PAGO = ["Efectivo", "Tarjeta", "Transferencia", "Otro"]

export function Mostrador() {
  const supabase = createClient()
  const { toast } = useToast()

  const [productos, setProductos] = useState<Producto[]>([])
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [carrito, setCarrito] = useState<VentaItem[]>([])
  const [metodoPago, setMetodoPago] = useState<string>(METODOS_PAGO[0])
  const [isProcessingSale, setIsProcessingSale] = useState(false)

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    setLoadingProductos(true)
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
    setLoadingProductos(false)
  }

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prevCarrito) => {
      const itemExistente = prevCarrito.find((item) => item.producto_id === producto.id)
      if (itemExistente) {
        return prevCarrito.map((item) =>
          item.producto_id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        )
      } else {
        return [
          ...prevCarrito,
          { producto_id: producto.id, nombre: producto.nombre, cantidad: 1, precio_unitario: producto.precio },
        ]
      }
    })
  }

  const quitarDelCarrito = (productoId: string) => {
    setCarrito((prevCarrito) => prevCarrito.filter((item) => item.producto_id !== productoId))
  }

  const ajustarCantidad = (productoId: string, cantidad: number) => {
    setCarrito((prevCarrito) =>
      prevCarrito.map((item) => (item.producto_id === productoId ? { ...item, cantidad: cantidad } : item)),
    )
  }

  const totalCarrito = carrito.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0)

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      toast({
        title: "Error",
        description: "El carrito está vacío.",
        variant: "destructive",
      })
      return
    }

    setIsProcessingSale(true)

    // 1. Registrar la venta
    const { data: ventaData, error: ventaError } = await supabase
      .from("ventas")
      .insert({
        fecha: format(new Date(), "yyyy-MM-dd"),
        total: totalCarrito,
        metodo_pago: metodoPago,
        user_id: (await supabase.auth.getUser()).data.user?.id, // Assuming user is logged in
      })
      .select()

    if (ventaError) {
      toast({
        title: "Error",
        description: `Error al registrar la venta: ${ventaError.message}`,
        variant: "destructive",
      })
      setIsProcessingSale(false)
      return
    }

    const ventaId = ventaData[0].id

    // 2. Registrar los detalles de la venta y actualizar el stock
    const detallesVentaPromises = carrito.map(async (item) => {
      // Insertar detalle de venta
      const { error: detalleError } = await supabase.from("detalles_venta").insert({
        venta_id: ventaId,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      })

      if (detalleError) {
        console.error(`Error al guardar detalle de venta para ${item.nombre}:`, detalleError.message)
        // Consider rollback or partial success handling
      }

      // Actualizar stock
      const { error: stockError } = await supabase.rpc("disminuir_stock", {
        p_producto_id: item.producto_id,
        p_cantidad: item.cantidad,
      })

      if (stockError) {
        console.error(`Error al actualizar stock para ${item.nombre}:`, stockError.message)
        // Consider rollback or partial success handling
      }
    })

    await Promise.all(detallesVentaPromises)

    toast({
      title: "Venta Exitosa",
      description: `Venta por $${totalCarrito.toFixed(2)} registrada correctamente.`,
      variant: "default",
    })

    setCarrito([])
    setMetodoPago(METODOS_PAGO[0])
    fetchProductos() // Refresh product list to show updated stock
    setIsProcessingSale(false)
  }

  if (loadingProductos) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
            {filteredProductos.length === 0 ? (
              <p className="col-span-2 text-center text-gray-500">No se encontraron productos.</p>
            ) : (
              filteredProductos.map((producto) => (
                <Button
                  key={producto.id}
                  variant="outline"
                  className="flex flex-col h-auto py-4 bg-transparent"
                  onClick={() => agregarAlCarrito(producto)}
                  disabled={producto.stock <= 0}
                >
                  <span className="font-semibold">{producto.nombre}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">${producto.precio.toFixed(2)}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Stock: {producto.stock}</span>
                </Button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Carrito de Compras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {carrito.length === 0 ? (
            <p className="text-center text-gray-500">El carrito está vacío.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carrito.map((item) => (
                  <TableRow key={item.producto_id}>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => ajustarCantidad(item.producto_id, Number.parseInt(e.target.value) || 0)}
                        className="w-20 text-center"
                        min="1"
                      />
                    </TableCell>
                    <TableCell className="text-right">${item.precio_unitario.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(item.cantidad * item.precio_unitario).toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="destructive" size="sm" onClick={() => quitarDelCarrito(item.producto_id)}>
                        Quitar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${totalCarrito.toFixed(2)}</span>
          </div>

          <div>
            <Label htmlFor="metodo-pago">Método de Pago</Label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
              <SelectTrigger id="metodo-pago">
                <SelectValue placeholder="Selecciona un método de pago" />
              </SelectTrigger>
              <SelectContent>
                {METODOS_PAGO.map((metodo) => (
                  <SelectItem key={metodo} value={metodo}>
                    {metodo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={procesarVenta} className="w-full" disabled={carrito.length === 0 || isProcessingSale}>
            {isProcessingSale ? <LoadingSpinner className="mr-2" /> : null}
            {isProcessingSale ? "Procesando..." : "Procesar Venta"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
