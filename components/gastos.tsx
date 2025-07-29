"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LoadingSpinner } from "./loading-spinner"
import { ExportButton } from "./export-button"

interface Gasto {
  id: string
  fecha: string
  monto: number
  descripcion: string
  categoria: string
  created_at: string
}

export function Gastos() {
  const supabase = createClient()
  const { user } = useAuth()
  const { toast } = useToast()

  const [fecha, setFecha] = useState(format(new Date(), "yyyy-MM-dd"))
  const [monto, setMonto] = useState<number>(0)
  const [descripcion, setDescripcion] = useState("")
  const [categoria, setCategoria] = useState("")
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const categoriasGastos = ["Alquiler", "Servicios", "Salarios", "Mantenimiento", "Marketing", "Suministros", "Otros"]

  useEffect(() => {
    if (user) {
      fetchGastos()
    }
  }, [user])

  const fetchGastos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("gastos")
      .select("*")
      .eq("user_id", user?.id)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Error al cargar gastos",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setGastos(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para registrar un gasto.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    const { data, error } = await supabase.from("gastos").insert({
      user_id: user.id,
      fecha: fecha,
      monto: monto,
      descripcion: descripcion,
      categoria: categoria,
    })

    if (error) {
      toast({
        title: "Error al registrar gasto",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Gasto registrado",
        description: "El gasto ha sido guardado exitosamente.",
        variant: "default",
      })
      // Clear form and refetch
      setMonto(0)
      setDescripcion("")
      setCategoria("")
      setFecha(format(new Date(), "yyyy-MM-dd"))
      fetchGastos()
    }
    setSubmitting(false)
  }

  const exportHeaders = [
    { key: "fecha", label: "Fecha" },
    { key: "monto", label: "Monto" },
    { key: "descripcion", label: "Descripción" },
    { key: "categoria", label: "Categoría" },
  ] as const // 'as const' for type safety

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Nuevo Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monto">Monto</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(Number.parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={categoria} onValueChange={setCategoria} required>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasGastos.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
            </div>
            <Button type="submit" className="md:col-span-2" disabled={submitting}>
              {submitting ? <LoadingSpinner className="mr-2" /> : null}
              Registrar Gasto
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Historial de Gastos</CardTitle>
          <ExportButton data={gastos} filename="gastos" headers={exportHeaders} />
        </CardHeader>
        <CardContent>
          {gastos.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay gastos registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gastos.map((gasto) => (
                    <TableRow key={gasto.id}>
                      <TableCell>{format(new Date(gasto.fecha), "dd/MM/yyyy", { locale: es })}</TableCell>
                      <TableCell>{gasto.monto.toFixed(2)}</TableCell>
                      <TableCell>{gasto.descripcion}</TableCell>
                      <TableCell>{gasto.categoria}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
