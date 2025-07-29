"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useProducts } from "@/hooks/use-products"
import { useSales } from "@/hooks/use-sales"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "./loading-spinner"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  stock: number
}

export function Mostrador() {
  const { products, loading: productsLoading, error: productsError } = useProducts()
  const { addSale, loading: salesLoading } = useSales()
  const { toast } = useToast()

  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")

  const handleAddToCart = () => {
    if (!selectedProductId) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un producto.",
        variant: "destructive",
      })
      return
    }

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        toast({
          title: "Stock insuficiente",
          description: `Solo quedan ${product.stock} unidades de ${product.name}.`,
          variant: "destructive",
        })
        return
      }
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)))
    } else {
      if (quantity > product.stock) {
        toast({
          title: "Stock insuficiente",
          description: `Solo quedan ${product.stock} unidades de ${product.name}.`,
          variant: "destructive",
        })
        return
      }
      setCart([...cart, { ...product, quantity, stock: product.stock }])
    }
    setQuantity(1) // Reset quantity after adding to cart
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

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
        total_amount: totalAmount,
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price_at_sale: item.price,
        })),
      })
      toast({
        title: "Venta registrada",
        description: "La venta se ha procesado exitosamente.",
      })
      setCart([])
      setSelectedProductId(undefined)
      setQuantity(1)
      setPaymentMethod("cash")
    } catch (err: any) {
      toast({
        title: "Error al procesar venta",
        description: err.message || "Ocurrió un error inesperado.",
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
                <SelectValue placeholder="Selecciona un producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} (Stock: {product.stock})
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
              onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
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
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
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
              <SelectValue placeholder="Selecciona un método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Efectivo</SelectItem>
              <SelectItem value="card">Tarjeta</SelectItem>
              <SelectItem value="transfer">Transferencia</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
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
