"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Trash2, CreditCard, Banknote, Users, Clock, Search, ArrowLeftRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Producto {
  id: number
  nombre: string
  precio: number
  categoria: string
}

interface ItemVenta {
  producto: Producto
  cantidad: number
  subtotal: number
}

interface Mesa {
  id: number
  numero: string
  items: ItemVenta[]
  total: number
  estado: "abierta" | "cerrada"
  horaApertura: string
}

export default function Mostrador() {
  const [mesas, setMesas] = useState<Mesa[]>([
    {
      id: 1,
      numero: "Mesa 1",
      items: [
        { producto: { id: 1, nombre: "Coca Cola", precio: 150, categoria: "Bebidas" }, cantidad: 2, subtotal: 300 },
      ],
      total: 300,
      estado: "abierta",
      horaApertura: "14:30",
    },
    {
      id: 2,
      numero: "Mesa 2",
      items: [
        { producto: { id: 2, nombre: "Hamburguesa", precio: 850, categoria: "Comida" }, cantidad: 1, subtotal: 850 },
        { producto: { id: 1, nombre: "Coca Cola", precio: 150, categoria: "Bebidas" }, cantidad: 1, subtotal: 150 },
      ],
      total: 1000,
      estado: "abierta",
      horaApertura: "15:15",
    },
  ])

  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null)
  const [showNuevaMesa, setShowNuevaMesa] = useState(false)
  const [numeroNuevaMesa, setNumeroNuevaMesa] = useState("")
  const [busquedaProducto, setBusquedaProducto] = useState("")

  const productos: Producto[] = [
    { id: 1, nombre: "Coca Cola", precio: 150, categoria: "Bebidas" },
    { id: 2, nombre: "Agua Mineral", precio: 100, categoria: "Bebidas" },
    { id: 3, nombre: "Hamburguesa", precio: 850, categoria: "Comida" },
    { id: 4, nombre: "Pizza", precio: 1200, categoria: "Comida" },
    { id: 5, nombre: "Papas Fritas", precio: 400, categoria: "Comida" },
    { id: 6, nombre: "Cerveza", precio: 200, categoria: "Bebidas" },
    { id: 7, nombre: "Sandwich", precio: 650, categoria: "Comida" },
    { id: 8, nombre: "Café", precio: 120, categoria: "Bebidas" },
    { id: 9, nombre: "Empanadas", precio: 180, categoria: "Comida" },
    { id: 10, nombre: "Jugo Natural", precio: 180, categoria: "Bebidas" },
  ]

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(busquedaProducto.toLowerCase()),
  )

  const crearNuevaMesa = () => {
    if (!numeroNuevaMesa.trim()) return

    const nuevaMesa: Mesa = {
      id: Date.now(),
      numero: numeroNuevaMesa,
      items: [],
      total: 0,
      estado: "abierta",
      horaApertura: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    }

    setMesas([...mesas, nuevaMesa])
    setNumeroNuevaMesa("")
    setShowNuevaMesa(false)
  }

  const agregarProducto = (producto: Producto) => {
    if (!mesaSeleccionada) return

    const mesasActualizadas = mesas.map((mesa) => {
      if (mesa.id === mesaSeleccionada.id) {
        const itemExistente = mesa.items.find((item) => item.producto.id === producto.id)

        if (itemExistente) {
          const itemsActualizados = mesa.items.map((item) =>
            item.producto.id === producto.id
              ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * producto.precio }
              : item,
          )
          const nuevoTotal = itemsActualizados.reduce((sum, item) => sum + item.subtotal, 0)
          return { ...mesa, items: itemsActualizados, total: nuevoTotal }
        } else {
          const nuevoItem: ItemVenta = {
            producto,
            cantidad: 1,
            subtotal: producto.precio,
          }
          const itemsActualizados = [...mesa.items, nuevoItem]
          const nuevoTotal = itemsActualizados.reduce((sum, item) => sum + item.subtotal, 0)
          return { ...mesa, items: itemsActualizados, total: nuevoTotal }
        }
      }
      return mesa
    })

    setMesas(mesasActualizadas)
    setMesaSeleccionada(mesasActualizadas.find((m) => m.id === mesaSeleccionada.id) || null)
  }

  const modificarCantidad = (productoId: number, nuevaCantidad: number) => {
    if (!mesaSeleccionada || nuevaCantidad < 0) return

    const mesasActualizadas = mesas.map((mesa) => {
      if (mesa.id === mesaSeleccionada.id) {
        const itemsActualizados = mesa.items
          .map((item) =>
            item.producto.id === productoId
              ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.producto.precio }
              : item,
          )
          .filter((item) => item.cantidad > 0)

        const nuevoTotal = itemsActualizados.reduce((sum, item) => sum + item.subtotal, 0)
        return { ...mesa, items: itemsActualizados, total: nuevoTotal }
      }
      return mesa
    })

    setMesas(mesasActualizadas)
    setMesaSeleccionada(mesasActualizadas.find((m) => m.id === mesaSeleccionada.id) || null)
  }

  const cerrarMesa = (metodoPago: string) => {
    if (!mesaSeleccionada) return

    const mesasActualizadas = mesas.map((mesa) =>
      mesa.id === mesaSeleccionada.id ? { ...mesa, estado: "cerrada" as const } : mesa,
    )

    setMesas(mesasActualizadas.filter((mesa) => mesa.estado === "abierta"))
    setMesaSeleccionada(null)

    // Aquí guardarías la venta en el historial
    console.log(`Mesa cerrada con ${metodoPago}:`, mesaSeleccionada)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de Mesas */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mesas Abiertas</CardTitle>
          <Dialog open={showNuevaMesa} onOpenChange={setShowNuevaMesa}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Mesa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="numero">Número/Nombre de Mesa</Label>
                  <Input
                    id="numero"
                    value={numeroNuevaMesa}
                    onChange={(e) => setNumeroNuevaMesa(e.target.value)}
                    placeholder="Ej: Mesa 5, Cancha 1, etc."
                  />
                </div>
                <Button onClick={crearNuevaMesa} className="w-full">
                  Crear Mesa
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-2">
          {mesas.map((mesa) => (
            <Card
              key={mesa.id}
              className={`cursor-pointer transition-colors ${
                mesaSeleccionada?.id === mesa.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setMesaSeleccionada(mesa)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{mesa.numero}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {mesa.horaApertura}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${mesa.total}</div>
                    <Badge variant="secondary" className="text-xs">
                      {mesa.items.length} items
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Productos */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
            {productosFiltrados.map((producto) => (
              <Card
                key={producto.id}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => agregarProducto(producto)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{producto.nombre}</h4>
                      <Badge variant="outline" className="text-xs">
                        {producto.categoria}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${producto.precio}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalle de Mesa */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>{mesaSeleccionada ? mesaSeleccionada.numero : "Selecciona una mesa"}</CardTitle>
        </CardHeader>
        <CardContent>
          {mesaSeleccionada ? (
            <div className="space-y-4">
              {/* Items de la mesa */}
              <div className="space-y-2">
                {mesaSeleccionada.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium">{item.producto.nombre}</div>
                      <div className="text-sm text-muted-foreground">${item.producto.precio} c/u</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => modificarCantidad(item.producto.id, item.cantidad - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.cantidad}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => modificarCantidad(item.producto.id, item.cantidad + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => modificarCantidad(item.producto.id, 0)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="w-20 text-right font-medium">${item.subtotal}</div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>${mesaSeleccionada.total}</span>
              </div>

              {/* Botones de pago */}
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => cerrarMesa("efectivo")}
                  disabled={mesaSeleccionada.items.length === 0}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Cobrar en Efectivo
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => cerrarMesa("tarjeta")}
                  disabled={mesaSeleccionada.items.length === 0}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cobrar con Tarjeta
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => cerrarMesa("transferencia")}
                  disabled={mesaSeleccionada.items.length === 0}
                >
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Cobrar con Transferencia
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona una mesa para ver los detalles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
