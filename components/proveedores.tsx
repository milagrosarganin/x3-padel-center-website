"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Edit, Phone, Mail, MapPin, Search, ShoppingCart } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Proveedor {
  id: number
  nombre: string
  contacto: string
  telefono: string
  email: string
  direccion: string
  productos: string[]
  ultimaCompra: string
  totalCompras: number
  estado: "activo" | "inactivo"
}

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([
    {
      id: 1,
      nombre: "Distribuidora Sur",
      contacto: "Juan Pérez",
      telefono: "+54 11 1234-5678",
      email: "ventas@distribuidorasur.com",
      direccion: "Av. Libertador 1234, CABA",
      productos: ["Coca Cola", "Agua Mineral", "Cerveza"],
      ultimaCompra: "20/01/2025",
      totalCompras: 15600,
      estado: "activo",
    },
    {
      id: 2,
      nombre: "Carnicería Central",
      contacto: "María González",
      telefono: "+54 11 2345-6789",
      email: "pedidos@carniceriacentral.com",
      direccion: "San Martín 567, San Isidro",
      productos: ["Hamburguesa (Medallón)", "Carne Asada"],
      ultimaCompra: "25/01/2025",
      totalCompras: 8900,
      estado: "activo",
    },
    {
      id: 3,
      nombre: "Panadería Local",
      contacto: "Carlos Rodríguez",
      telefono: "+54 11 3456-7890",
      email: "info@panaderialocal.com",
      direccion: "Belgrano 890, Vicente López",
      productos: ["Pan Hamburguesa", "Pan Tostado"],
      ultimaCompra: "24/01/2025",
      totalCompras: 2300,
      estado: "activo",
    },
    {
      id: 4,
      nombre: "Mayorista Alimentos",
      contacto: "Ana Martínez",
      telefono: "+54 11 4567-8901",
      email: "compras@mayoristaalimentos.com",
      direccion: "Ruta 8 Km 45, Pilar",
      productos: ["Papas Fritas (Kg)", "Aceite", "Condimentos"],
      ultimaCompra: "22/01/2025",
      totalCompras: 5400,
      estado: "inactivo",
    },
  ])

  const [showNuevoProveedor, setShowNuevoProveedor] = useState(false)
  const [showEditarProveedor, setShowEditarProveedor] = useState(false)
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null)
  const [busqueda, setBusqueda] = useState("")

  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    productos: "",
  })

  const proveedoresFiltrados = proveedores.filter(
    (proveedor) =>
      proveedor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.contacto.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.productos.some((p) => p.toLowerCase().includes(busqueda.toLowerCase())),
  )

  const proveedoresActivos = proveedores.filter((p) => p.estado === "activo").length
  const totalCompras = proveedores.reduce((sum, p) => sum + p.totalCompras, 0)

  const agregarProveedor = () => {
    const proveedor: Proveedor = {
      id: Date.now(),
      ...nuevoProveedor,
      productos: nuevoProveedor.productos.split(",").map((p) => p.trim()),
      ultimaCompra: "Nunca",
      totalCompras: 0,
      estado: "activo",
    }

    setProveedores([...proveedores, proveedor])
    setNuevoProveedor({
      nombre: "",
      contacto: "",
      telefono: "",
      email: "",
      direccion: "",
      productos: "",
    })
    setShowNuevoProveedor(false)
  }

  const editarProveedor = () => {
    if (!proveedorEditando) return

    setProveedores(proveedores.map((p) => (p.id === proveedorEditando.id ? proveedorEditando : p)))
    setShowEditarProveedor(false)
    setProveedorEditando(null)
  }

  const toggleEstadoProveedor = (id: number) => {
    setProveedores(
      proveedores.map((p) => (p.id === id ? { ...p, estado: p.estado === "activo" ? "inactivo" : "activo" } : p)),
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Proveedores</p>
                <p className="text-2xl font-bold">{proveedores.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-green-500">{proveedoresActivos}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Compras</p>
                <p className="text-2xl font-bold">${totalCompras}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promedio Compra</p>
                <p className="text-2xl font-bold">
                  ${proveedores.length > 0 ? Math.round(totalCompras / proveedores.length) : 0}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de Proveedores */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Proveedores</CardTitle>
          <Dialog open={showNuevoProveedor} onOpenChange={setShowNuevoProveedor}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Proveedor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre de la Empresa</Label>
                  <Input
                    id="nombre"
                    value={nuevoProveedor.nombre}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contacto">Persona de Contacto</Label>
                  <Input
                    id="contacto"
                    value={nuevoProveedor.contacto}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, contacto: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={nuevoProveedor.telefono}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={nuevoProveedor.email}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    value={nuevoProveedor.direccion}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, direccion: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="productos">Productos (separados por coma)</Label>
                  <Textarea
                    id="productos"
                    value={nuevoProveedor.productos}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, productos: e.target.value })}
                    placeholder="Ej: Coca Cola, Agua Mineral, Cerveza"
                  />
                </div>
                <Button onClick={agregarProveedor} className="w-full">
                  Agregar Proveedor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proveedores..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Total Compras</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proveedoresFiltrados.map((proveedor) => (
                <TableRow key={proveedor.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{proveedor.nombre}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {proveedor.direccion}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{proveedor.contacto}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {proveedor.telefono}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {proveedor.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {proveedor.productos.slice(0, 2).map((producto, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {producto}
                        </Badge>
                      ))}
                      {proveedor.productos.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{proveedor.productos.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{proveedor.ultimaCompra}</TableCell>
                  <TableCell className="font-medium">${proveedor.totalCompras}</TableCell>
                  <TableCell>
                    <Badge
                      variant={proveedor.estado === "activo" ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleEstadoProveedor(proveedor.id)}
                    >
                      {proveedor.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={showEditarProveedor} onOpenChange={setShowEditarProveedor}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setProveedorEditando(proveedor)
                            setShowEditarProveedor(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Editar Proveedor</DialogTitle>
                        </DialogHeader>
                        {proveedorEditando && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="editNombre">Nombre de la Empresa</Label>
                              <Input
                                id="editNombre"
                                value={proveedorEditando.nombre}
                                onChange={(e) => setProveedorEditando({ ...proveedorEditando, nombre: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="editContacto">Persona de Contacto</Label>
                              <Input
                                id="editContacto"
                                value={proveedorEditando.contacto}
                                onChange={(e) =>
                                  setProveedorEditando({ ...proveedorEditando, contacto: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="editTelefono">Teléfono</Label>
                              <Input
                                id="editTelefono"
                                value={proveedorEditando.telefono}
                                onChange={(e) =>
                                  setProveedorEditando({ ...proveedorEditando, telefono: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="editEmail">Email</Label>
                              <Input
                                id="editEmail"
                                type="email"
                                value={proveedorEditando.email}
                                onChange={(e) => setProveedorEditando({ ...proveedorEditando, email: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="editDireccion">Dirección</Label>
                              <Textarea
                                id="editDireccion"
                                value={proveedorEditando.direccion}
                                onChange={(e) =>
                                  setProveedorEditando({ ...proveedorEditando, direccion: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="editProductos">Productos (separados por coma)</Label>
                              <Textarea
                                id="editProductos"
                                value={proveedorEditando.productos.join(", ")}
                                onChange={(e) =>
                                  setProveedorEditando({
                                    ...proveedorEditando,
                                    productos: e.target.value.split(",").map((p) => p.trim()),
                                  })
                                }
                              />
                            </div>
                            <Button onClick={editarProveedor} className="w-full">
                              Guardar Cambios
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
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
