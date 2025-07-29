"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Edit, AlertTriangle, Search, Filter, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/pagination"
import { ExportButton } from "@/components/export-button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useProductos } from "@/hooks/use-productos"

export default function Stock() {
  const { productos, loading, agregarProducto, actualizarProducto, eliminarProducto } = useProductos()

  const [showNuevoProducto, setShowNuevoProducto] = useState(false)
  const [showEditarProducto, setShowEditarProducto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<any>(null)
  const [filtroCategoria, setFiltroCategoria] = useState("all")
  const [filtroStock, setFiltroStock] = useState("all")
  const [busqueda, setBusqueda] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const itemsPerPage = 10

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    categoria: "",
    stock: 0,
    stock_minimo: 0,
    precio: 0,
    proveedor: "",
  })

  const productosFiltrados = productos.filter((producto) => {
    const cumpleCategoria = filtroCategoria === "all" || producto.categoria === filtroCategoria
    const cumpleStock =
      filtroStock === "all" ||
      (filtroStock === "bajo" && producto.stock <= producto.stock_minimo) ||
      (filtroStock === "normal" && producto.stock > producto.stock_minimo)
    const cumpleBusqueda =
      !busqueda ||
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.proveedor?.toLowerCase().includes(busqueda.toLowerCase())

    return cumpleCategoria && cumpleStock && cumpleBusqueda
  })

  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const productosPaginados = productosFiltrados.slice(startIndex, startIndex + itemsPerPage)

  const productosStockBajo = productos.filter((p) => p.stock <= p.stock_minimo)
  const categorias = [...new Set(productos.map((p) => p.categoria))]

  const validateForm = (data: typeof nuevoProducto) => {
    const newErrors: Record<string, string> = {}

    if (!data.nombre.trim()) newErrors.nombre = "El nombre es obligatorio"
    if (!data.categoria.trim()) newErrors.categoria = "La categoría es obligatoria"
    if (data.precio <= 0) newErrors.precio = "El precio debe ser mayor a 0"
    if (data.stock < 0) newErrors.stock = "El stock no puede ser negativo"
    if (data.stock_minimo < 0) newErrors.stock_minimo = "El stock mínimo no puede ser negativo"
    if (!data.proveedor.trim()) newErrors.proveedor = "El proveedor es obligatorio"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAgregarProducto = async () => {
    if (!validateForm(nuevoProducto)) return

    setSubmitting(true)
    const success = await agregarProducto(nuevoProducto)

    if (success) {
      setNuevoProducto({
        nombre: "",
        categoria: "",
        stock: 0,
        stock_minimo: 0,
        precio: 0,
        proveedor: "",
      })
      setErrors({})
      setShowNuevoProducto(false)
    }
    setSubmitting(false)
  }

  const handleEditarProducto = async () => {
    if (!productoEditando) return

    setSubmitting(true)
    const success = await actualizarProducto(productoEditando.id, {
      nombre: productoEditando.nombre,
      categoria: productoEditando.categoria,
      stock: productoEditando.stock,
      stock_minimo: productoEditando.stock_minimo,
      precio: productoEditando.precio,
      proveedor: productoEditando.proveedor,
    })

    if (success) {
      setShowEditarProducto(false)
      setProductoEditando(null)
    }
    setSubmitting(false)
  }

  const handleEliminarProducto = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      await eliminarProducto(id)
    }
  }

  const getStockStatus = (producto: any) => {
    if (producto.stock === 0) return { color: "destructive", text: "Sin Stock" }
    if (producto.stock <= producto.stock_minimo) return { color: "secondary", text: "Stock Bajo" }
    return { color: "default", text: "Stock OK" }
  }

  const limpiarFiltros = () => {
    setFiltroCategoria("all")
    setFiltroStock("all")
    setBusqueda("")
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
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
                <p className="text-sm text-muted-foreground">Total Productos</p>
                <p className="text-2xl font-bold">{productos.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock Bajo</p>
                <p className="text-2xl font-bold text-orange-500">{productosStockBajo.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categorías</p>
                <p className="text-2xl font-bold">{categorias.length}</p>
              </div>
              <Filter className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">${productos.reduce((sum, p) => sum + p.stock * p.precio, 0)}</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Stock Bajo */}
      {productosStockBajo.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Productos con Stock Bajo ({productosStockBajo.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {productosStockBajo.map((producto) => (
                <div key={producto.id} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="font-medium">{producto.nombre}</span>
                  <Badge variant="secondary">
                    {producto.stock}/{producto.stock_minimo}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y Acciones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Stock</CardTitle>
          <Dialog open={showNuevoProducto} onOpenChange={setShowNuevoProducto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Producto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Producto</Label>
                  <Input
                    id="nombre"
                    value={nuevoProducto.nombre}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                    className={errors.nombre ? "border-red-500" : ""}
                  />
                  {errors.nombre && <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>}
                </div>
                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Input
                    id="categoria"
                    value={nuevoProducto.categoria}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })}
                    className={errors.categoria ? "border-red-500" : ""}
                  />
                  {errors.categoria && <p className="text-sm text-red-500 mt-1">{errors.categoria}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock Actual</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={nuevoProducto.stock}
                      onChange={(e) =>
                        setNuevoProducto({ ...nuevoProducto, stock: Number.parseInt(e.target.value) || 0 })
                      }
                      className={errors.stock ? "border-red-500" : ""}
                    />
                    {errors.stock && <p className="text-sm text-red-500 mt-1">{errors.stock}</p>}
                  </div>
                  <div>
                    <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                    <Input
                      id="stockMinimo"
                      type="number"
                      value={nuevoProducto.stock_minimo}
                      onChange={(e) =>
                        setNuevoProducto({ ...nuevoProducto, stock_minimo: Number.parseInt(e.target.value) || 0 })
                      }
                      className={errors.stock_minimo ? "border-red-500" : ""}
                    />
                    {errors.stock_minimo && <p className="text-sm text-red-500 mt-1">{errors.stock_minimo}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={nuevoProducto.precio}
                    onChange={(e) =>
                      setNuevoProducto({ ...nuevoProducto, precio: Number.parseFloat(e.target.value) || 0 })
                    }
                    className={errors.precio ? "border-red-500" : ""}
                  />
                  {errors.precio && <p className="text-sm text-red-500 mt-1">{errors.precio}</p>}
                </div>
                <div>
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input
                    id="proveedor"
                    value={nuevoProducto.proveedor}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, proveedor: e.target.value })}
                    className={errors.proveedor ? "border-red-500" : ""}
                  />
                  {errors.proveedor && <p className="text-sm text-red-500 mt-1">{errors.proveedor}</p>}
                </div>
                <Button onClick={handleAgregarProducto} className="w-full" disabled={submitting}>
                  {submitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  {submitting ? "Agregando..." : "Agregar Producto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
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

            <Select value={filtroStock} onValueChange={setFiltroStock}>
              <SelectTrigger>
                <SelectValue placeholder="Estado de stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="bajo">Stock Bajo</SelectItem>
                <SelectItem value="normal">Stock Normal</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={limpiarFiltros}>
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>

            <ExportButton data={productosFiltrados} filename="inventario-stock" type="stock" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Stock Mín.</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosPaginados.map((producto) => {
                const status = getStockStatus(producto)
                return (
                  <TableRow key={producto.id}>
                    <TableCell className="font-medium">{producto.nombre}</TableCell>
                    <TableCell>{producto.categoria}</TableCell>
                    <TableCell className="font-medium">{producto.stock}</TableCell>
                    <TableCell>{producto.stock_minimo}</TableCell>
                    <TableCell>${producto.precio}</TableCell>
                    <TableCell>{producto.proveedor}</TableCell>
                    <TableCell>{producto.ultima_compra}</TableCell>
                    <TableCell>
                      <Badge variant={status.color as any}>{status.text}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={showEditarProducto} onOpenChange={setShowEditarProducto}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setProductoEditando(producto)
                                setShowEditarProducto(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Producto</DialogTitle>
                            </DialogHeader>
                            {productoEditando && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="editNombre">Nombre del Producto</Label>
                                  <Input
                                    id="editNombre"
                                    value={productoEditando.nombre}
                                    onChange={(e) =>
                                      setProductoEditando({ ...productoEditando, nombre: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editCategoria">Categoría</Label>
                                  <Input
                                    id="editCategoria"
                                    value={productoEditando.categoria}
                                    onChange={(e) =>
                                      setProductoEditando({ ...productoEditando, categoria: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="editStock">Stock Actual</Label>
                                    <Input
                                      id="editStock"
                                      type="number"
                                      value={productoEditando.stock}
                                      onChange={(e) =>
                                        setProductoEditando({
                                          ...productoEditando,
                                          stock: Number.parseInt(e.target.value) || 0,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editStockMinimo">Stock Mínimo</Label>
                                    <Input
                                      id="editStockMinimo"
                                      type="number"
                                      value={productoEditando.stock_minimo}
                                      onChange={(e) =>
                                        setProductoEditando({
                                          ...productoEditando,
                                          stock_minimo: Number.parseInt(e.target.value) || 0,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="editPrecio">Precio</Label>
                                  <Input
                                    id="editPrecio"
                                    type="number"
                                    step="0.01"
                                    value={productoEditando.precio}
                                    onChange={(e) =>
                                      setProductoEditando({
                                        ...productoEditando,
                                        precio: Number.parseFloat(e.target.value) || 0,
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editProveedor">Proveedor</Label>
                                  <Input
                                    id="editProveedor"
                                    value={productoEditando.proveedor}
                                    onChange={(e) =>
                                      setProductoEditando({ ...productoEditando, proveedor: e.target.value })
                                    }
                                  />
                                </div>
                                <Button onClick={handleEditarProducto} className="w-full" disabled={submitting}>
                                  {submitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                                  {submitting ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEliminarProducto(producto.id, producto.nombre)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
