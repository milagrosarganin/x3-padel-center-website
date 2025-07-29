"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, CreditCard, Banknote, Eye, ArrowLeftRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination } from "@/components/pagination"
import { ExportButton } from "@/components/export-button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/hooks/use-toast"

interface Venta {
  id: number
  fecha: string
  hora: string
  mesa: string
  items: Array<{
    producto: string
    cantidad: number
    precio: number
    subtotal: number
  }>
  total: number
  metodoPago: "efectivo" | "tarjeta" | "transferencia"
  estado: "completada" | "cancelada"
}

export default function HistorialVentas() {
  const [ventas] = useState<Venta[]>([
    {
      id: 1001,
      fecha: "26/01/2025",
      hora: "14:30",
      mesa: "Mesa 1",
      items: [
        { producto: "Coca Cola", cantidad: 2, precio: 150, subtotal: 300 },
        { producto: "Hamburguesa", cantidad: 1, precio: 850, subtotal: 850 },
      ],
      total: 1150,
      metodoPago: "efectivo",
      estado: "completada",
    },
    {
      id: 1002,
      fecha: "26/01/2025",
      hora: "15:15",
      mesa: "Mesa 2",
      items: [
        { producto: "Pizza", cantidad: 1, precio: 1200, subtotal: 1200 },
        { producto: "Cerveza", cantidad: 2, precio: 200, subtotal: 400 },
      ],
      total: 1600,
      metodoPago: "tarjeta",
      estado: "completada",
    },
    {
      id: 1003,
      fecha: "25/01/2025",
      hora: "16:45",
      mesa: "Mesa 3",
      items: [
        { producto: "Papas Fritas", cantidad: 1, precio: 400, subtotal: 400 },
        { producto: "Agua Mineral", cantidad: 2, precio: 100, subtotal: 200 },
      ],
      total: 600,
      metodoPago: "transferencia",
      estado: "completada",
    },
    {
      id: 1004,
      fecha: "25/01/2025",
      hora: "18:20",
      mesa: "Mesa 1",
      items: [{ producto: "Hamburguesa", cantidad: 2, precio: 850, subtotal: 1700 }],
      total: 1700,
      metodoPago: "tarjeta",
      estado: "cancelada",
    },
  ])

  const [filtroFecha, setFiltroFecha] = useState("")
  const [filtroMetodo, setFiltroMetodo] = useState("all")
  const [filtroEstado, setFiltroEstado] = useState("all")
  const [busqueda, setBusqueda] = useState("")
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 10
  const { toast } = useToast()

  const ventasFiltradas = ventas.filter((venta) => {
    const cumpleFecha = !filtroFecha || venta.fecha.includes(filtroFecha)
    const cumpleMetodo = filtroMetodo === "all" || venta.metodoPago === filtroMetodo
    const cumpleEstado = filtroEstado === "all" || venta.estado === filtroEstado
    const cumpleBusqueda =
      !busqueda || venta.mesa.toLowerCase().includes(busqueda.toLowerCase()) || venta.id.toString().includes(busqueda)

    return cumpleFecha && cumpleMetodo && cumpleEstado && cumpleBusqueda
  })

  const totalPages = Math.ceil(ventasFiltradas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const ventasPaginadas = ventasFiltradas.slice(startIndex, startIndex + itemsPerPage)

  const totalVentas = ventasFiltradas.reduce(
    (sum, venta) => (venta.estado === "completada" ? sum + venta.total : sum),
    0,
  )

  const ventasEfectivo = ventasFiltradas
    .filter((v) => v.metodoPago === "efectivo" && v.estado === "completada")
    .reduce((sum, venta) => sum + venta.total, 0)

  const ventasTarjeta = ventasFiltradas
    .filter((v) => v.metodoPago === "tarjeta" && v.estado === "completada")
    .reduce((sum, venta) => sum + venta.total, 0)

  const ventasTransferencia = ventasFiltradas
    .filter((v) => v.metodoPago === "transferencia" && v.estado === "completada")
    .reduce((sum, venta) => sum + venta.total, 0)

  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case "efectivo":
        return <Banknote className="h-4 w-4 text-green-600" />
      case "tarjeta":
        return <CreditCard className="h-4 w-4 text-blue-600" />
      case "transferencia":
        return <ArrowLeftRight className="h-4 w-4 text-purple-600" />
      default:
        return null
    }
  }

  const limpiarFiltros = () => {
    setFiltroFecha("")
    setFiltroMetodo("all")
    setFiltroEstado("all")
    setBusqueda("")
    setCurrentPage(1)
    toast({
      title: "Filtros limpiados",
      description: "Se han restablecido todos los filtros",
    })
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ventas</p>
                <p className="text-2xl font-bold">${totalVentas}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Efectivo</p>
                <p className="text-2xl font-bold">${ventasEfectivo}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Banknote className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tarjeta</p>
                <p className="text-2xl font-bold">${ventasTarjeta}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transferencia</p>
                <p className="text-2xl font-bold">${ventasTransferencia}</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <ArrowLeftRight className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por mesa o ID..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>

            <Input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              placeholder="Fecha"
            />

            <Select value={filtroMetodo} onValueChange={setFiltroMetodo}>
              <SelectTrigger>
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar
            </Button>

            <ExportButton data={ventasFiltradas} filename="historial-ventas" type="ventas" />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Ventas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historial de Ventas</CardTitle>
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, ventasFiltradas.length)} de{" "}
            {ventasFiltradas.length} resultados
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Mesa</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventasPaginadas.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell className="font-medium">#{venta.id}</TableCell>
                      <TableCell>
                        <div>
                          <div>{venta.fecha}</div>
                          <div className="text-sm text-muted-foreground">{venta.hora}</div>
                        </div>
                      </TableCell>
                      <TableCell>{venta.mesa}</TableCell>
                      <TableCell className="font-medium">${venta.total}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMetodoPagoIcon(venta.metodoPago)}
                          <span className="capitalize">{venta.metodoPago}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={venta.estado === "completada" ? "default" : "destructive"}>
                          {venta.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setVentaSeleccionada(venta)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Detalle de Venta #{venta.id}</DialogTitle>
                            </DialogHeader>
                            {ventaSeleccionada && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Fecha:</span>
                                    <div>
                                      {ventaSeleccionada.fecha} {ventaSeleccionada.hora}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Mesa:</span>
                                    <div>{ventaSeleccionada.mesa}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Método:</span>
                                    <div className="flex items-center gap-2">
                                      {getMetodoPagoIcon(ventaSeleccionada.metodoPago)}
                                      <span className="capitalize">{ventaSeleccionada.metodoPago}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Estado:</span>
                                    <Badge
                                      variant={ventaSeleccionada.estado === "completada" ? "default" : "destructive"}
                                      className="ml-1"
                                    >
                                      {ventaSeleccionada.estado}
                                    </Badge>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">Items:</h4>
                                  <div className="space-y-2">
                                    {ventaSeleccionada.items.map((item, index) => (
                                      <div key={index} className="flex justify-between text-sm">
                                        <span>
                                          {item.cantidad}x {item.producto}
                                        </span>
                                        <span>${item.subtotal}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="border-t pt-2">
                                  <div className="flex justify-between font-medium">
                                    <span>Total:</span>
                                    <span>${ventaSeleccionada.total}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
