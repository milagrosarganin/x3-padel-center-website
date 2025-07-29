"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, Plus, Edit, Trash2, Search, Filter, Calendar, Receipt } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Gasto {
  id: number
  fecha: string
  concepto: string
  categoria: string
  monto: number
  descripcion: string
  metodoPago: "efectivo" | "tarjeta" | "transferencia"
  proveedor?: string
  comprobante?: string
}

export default function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>([
    {
      id: 1,
      fecha: "26/01/2025",
      concepto: "Compra de bebidas",
      categoria: "Mercadería",
      monto: 2500,
      descripcion: "Coca Cola, Agua Mineral, Cerveza",
      metodoPago: "transferencia",
      proveedor: "Distribuidora Sur",
      comprobante: "FC-001-00001234",
    },
    {
      id: 2,
      fecha: "25/01/2025",
      concepto: "Servicio de limpieza",
      categoria: "Servicios",
      monto: 800,
      descripcion: "Limpieza semanal del local",
      metodoPago: "efectivo",
    },
    {
      id: 3,
      fecha: "24/01/2025",
      concepto: "Reparación de equipos",
      categoria: "Mantenimiento",
      monto: 1200,
      descripcion: "Reparación de máquina de café",
      metodoPago: "tarjeta",
      comprobante: "FC-002-00005678",
    },
    {
      id: 4,
      fecha: "23/01/2025",
      concepto: "Pago de alquiler",
      categoria: "Alquiler",
      monto: 45000,
      descripcion: "Alquiler mensual del local",
      metodoPago: "transferencia",
      comprobante: "REC-001-00000123",
    },
    {
      id: 5,
      fecha: "22/01/2025",
      concepto: "Compra de ingredientes",
      categoria: "Mercadería",
      monto: 1800,
      descripcion: "Carne, pan, papas para hamburguesas",
      metodoPago: "efectivo",
      proveedor: "Carnicería Central",
    },
  ])

  const [showNuevoGasto, setShowNuevoGasto] = useState(false)
  const [showEditarGasto, setShowEditarGasto] = useState(false)
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState("all")
  const [filtroMetodo, setFiltroMetodo] = useState("all")
  const [busqueda, setBusqueda] = useState("")

  const [nuevoGasto, setNuevoGasto] = useState({
    concepto: "",
    categoria: "Mercadería",
    monto: 0,
    descripcion: "",
    metodoPago: "efectivo" as const,
    proveedor: "",
    comprobante: "",
  })

  const gastosFiltrados = gastos.filter((gasto) => {
    const cumpleCategoria = filtroCategoria === "all" || gasto.categoria === filtroCategoria
    const cumpleMetodo = filtroMetodo === "all" || gasto.metodoPago === filtroMetodo
    const cumpleBusqueda =
      !busqueda ||
      gasto.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
      gasto.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      (gasto.proveedor && gasto.proveedor.toLowerCase().includes(busqueda.toLowerCase()))

    return cumpleCategoria && cumpleMetodo && cumpleBusqueda
  })

  const categorias = [...new Set(gastos.map((g) => g.categoria))]
  const totalGastos = gastosFiltrados.reduce((sum, gasto) => sum + gasto.monto, 0)
  const gastosHoy = gastos
    .filter((g) => g.fecha === new Date().toLocaleDateString("es-AR"))
    .reduce((sum, gasto) => sum + gasto.monto, 0)
  const gastosMes = gastos.reduce((sum, gasto) => sum + gasto.monto, 0)

  const agregarGasto = () => {
    const gasto: Gasto = {
      id: Date.now(),
      ...nuevoGasto,
      fecha: new Date().toLocaleDateString("es-AR"),
    }

    setGastos([gasto, ...gastos])
    setNuevoGasto({
      concepto: "",
      categoria: "Mercadería",
      monto: 0,
      descripcion: "",
      metodoPago: "efectivo",
      proveedor: "",
      comprobante: "",
    })
    setShowNuevoGasto(false)
  }

  const editarGasto = () => {
    if (!gastoEditando) return

    setGastos(gastos.map((g) => (g.id === gastoEditando.id ? gastoEditando : g)))
    setShowEditarGasto(false)
    setGastoEditando(null)
  }

  const eliminarGasto = (id: number) => {
    setGastos(gastos.filter((g) => g.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastos Hoy</p>
                <p className="text-2xl font-bold text-red-600">${gastosHoy}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastos del Mes</p>
                <p className="text-2xl font-bold text-red-600">${gastosMes}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Filtrado</p>
                <p className="text-2xl font-bold">${totalGastos}</p>
              </div>
              <Filter className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transacciones</p>
                <p className="text-2xl font-bold">{gastosFiltrados.length}</p>
              </div>
              <Receipt className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de Gastos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Gastos</CardTitle>
          <Dialog open={showNuevoGasto} onOpenChange={setShowNuevoGasto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="concepto">Concepto</Label>
                  <Input
                    id="concepto"
                    value={nuevoGasto.concepto}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, concepto: e.target.value })}
                    placeholder="Ej: Compra de bebidas"
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={nuevoGasto.categoria}
                    onValueChange={(value) => setNuevoGasto({ ...nuevoGasto, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mercadería">Mercadería</SelectItem>
                      <SelectItem value="Servicios">Servicios</SelectItem>
                      <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="Alquiler">Alquiler</SelectItem>
                      <SelectItem value="Impuestos">Impuestos</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="monto">Monto</Label>
                  <Input
                    id="monto"
                    type="number"
                    value={nuevoGasto.monto}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, monto: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="metodoPago">Método de Pago</Label>
                  <Select
                    value={nuevoGasto.metodoPago}
                    onValueChange={(value: any) => setNuevoGasto({ ...nuevoGasto, metodoPago: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="proveedor">Proveedor (Opcional)</Label>
                  <Input
                    id="proveedor"
                    value={nuevoGasto.proveedor}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, proveedor: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="comprobante">N° Comprobante (Opcional)</Label>
                  <Input
                    id="comprobante"
                    value={nuevoGasto.comprobante}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, comprobante: e.target.value })}
                    placeholder="Ej: FC-001-00001234"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={nuevoGasto.descripcion}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })}
                    placeholder="Detalle del gasto..."
                  />
                </div>
                <Button onClick={agregarGasto} className="w-full">
                  Registrar Gasto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar gastos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Más Filtros
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gastosFiltrados.map((gasto) => (
                <TableRow key={gasto.id}>
                  <TableCell>{gasto.fecha}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{gasto.concepto}</div>
                      <div className="text-sm text-muted-foreground">{gasto.descripcion}</div>
                      {gasto.comprobante && <div className="text-xs text-blue-600">{gasto.comprobante}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{gasto.categoria}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-red-600">-${gasto.monto}</TableCell>
                  <TableCell className="capitalize">{gasto.metodoPago}</TableCell>
                  <TableCell>{gasto.proveedor || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={showEditarGasto} onOpenChange={setShowEditarGasto}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setGastoEditando(gasto)
                              setShowEditarGasto(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Editar Gasto</DialogTitle>
                          </DialogHeader>
                          {gastoEditando && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="editConcepto">Concepto</Label>
                                <Input
                                  id="editConcepto"
                                  value={gastoEditando.concepto}
                                  onChange={(e) => setGastoEditando({ ...gastoEditando, concepto: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="editCategoria">Categoría</Label>
                                <Select
                                  value={gastoEditando.categoria}
                                  onValueChange={(value) => setGastoEditando({ ...gastoEditando, categoria: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Mercadería">Mercadería</SelectItem>
                                    <SelectItem value="Servicios">Servicios</SelectItem>
                                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                                    <SelectItem value="Alquiler">Alquiler</SelectItem>
                                    <SelectItem value="Impuestos">Impuestos</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                    <SelectItem value="Otros">Otros</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="editMonto">Monto</Label>
                                <Input
                                  id="editMonto"
                                  type="number"
                                  value={gastoEditando.monto}
                                  onChange={(e) =>
                                    setGastoEditando({
                                      ...gastoEditando,
                                      monto: Number.parseFloat(e.target.value) || 0,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="editDescripcion">Descripción</Label>
                                <Textarea
                                  id="editDescripcion"
                                  value={gastoEditando.descripcion}
                                  onChange={(e) => setGastoEditando({ ...gastoEditando, descripcion: e.target.value })}
                                />
                              </div>
                              <Button onClick={editarGasto} className="w-full">
                                Guardar Cambios
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button variant="destructive" size="sm" onClick={() => eliminarGasto(gasto.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
