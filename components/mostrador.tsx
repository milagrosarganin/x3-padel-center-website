"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useProductos } from "@/hooks/use-productos"
import { useSales } from "@/hooks/use-sales"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"

interface CartItem {
  id: string
  nombre: string
  precio_venta: number
  quantity: number
  stock_actual: number
}

const paymentMethodLabels: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  other: "Otro",
}

export function Mostrador() {
  const { productos, loading: productsLoading, error: productsError } = useProductos()
  const { addSale, loading: salesLoading } = useSales()
  const { toast } = useToast()

  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const selectedProduct = productos.find((p) => p.id === selectedProductId)


  const handleAddToCart = () => {
    if (!selectedProductId) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un producto.",
        variant: "destructive",
      })
      return
    }

    const product = productos.find((p) => p.id === selectedProductId)
    if (!product) return

    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock_actual) {
        toast({
          title: "Stock insuficiente",
          description: `Solo quedan ${product.stock_actual} unidades de ${product.nombre}.`,
          variant: "destructive",
        })
        return
      }
      setCart(cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      if (quantity > product.stock_actual) {
        toast({
          title: "Stock insuficiente",
          description: `Solo quedan ${product.stock_actual} unidades de ${product.nombre}.`,
          variant: "destructive",
        })
        return
      }
      setCart([...cart, { id: product.id, nombre: product.nombre, precio_venta: product.precio_venta, stock_actual: product.stock_actual, quantity }])
    }
    setQuantity(1)
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.precio_venta * item.quantity, 0)

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "El carrito está vacío.",
        variant: "destructive",
      })
      return
    }

    try {
      await addSale({
    total: totalAmount,
    metodo_pago: paymentMethod,
    origen: "Mostrador", // 👈 nuevo campo
    items: cart.map((item) => ({product_id: item.id, quantity: item.quantity, price_at_sale: item.precio_venta,})),
  })


      toast({
        title: "Venta registrada",
        description: "La venta se ha procesado exitosamente.",
      })
      setCart([])
      setSelectedProductId("")
      setQuantity(1)
      setPaymentMethod("cash")
    } catch (error: any) {
      console.error("Error en handleProcessSale:", error)

      toast({
        title: "Error al procesar venta",
        description: `Error al registrar los productos de la venta: ${error?.message || "Error desconocido"}`,
        variant: "destructive",
      })
    }

  }

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="ml-2">Cargando productos...</p>
      </div>
    )
  }

  if (productsError) {
    return (
      <div className="p-8 text-red-500">
        <p>Error al cargar productos: {productsError.message}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="grid gap-4 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">Añadir Producto a Venta</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product">Producto</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger id="product">
                <SelectValue placeholder="Selecciona un producto">
                  {selectedProduct ? `${selectedProduct.nombre} (Stock: ${selectedProduct.stock_actual})` : ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {productos.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.nombre} (Stock: {product.stock_actual})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
        <Button onClick={handleAddToCart} className="w-full">
          Añadir al Carrito
        </Button>
      </div>

      <div className="grid gap-4 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">Carrito de Compras</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio Unitario</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cart.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  El carrito está vacío.
                </TableCell>
              </TableRow>
            ) : (
              cart.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.precio_venta.toFixed(2)}</TableCell>
                  <TableCell>${(item.precio_venta * item.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveFromCart(item.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between font-semibold">
          <span>Total:</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment-method">Método de Pago</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger id="payment-method">
              <SelectValue placeholder="Selecciona un método">{paymentMethodLabels[paymentMethod]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(paymentMethodLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleProcessSale} disabled={cart.length === 0 || salesLoading} className="w-full">
          {salesLoading ? <LoadingSpinner className="mr-2" /> : null}
          Procesar Venta
        </Button>
      </div>
    </div>
  )
}
