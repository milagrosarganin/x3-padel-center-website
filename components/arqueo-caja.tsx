"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { LoadingSpinner } from "./loading-spinner"

interface ArqueoCajaEntry {
  id: string
  fecha: string
  saldo_inicial: number
  ventas_efectivo: number
  gastos_efectivo: number
  saldo_final: number
  diferencia: number
  comentarios: string | null
  created_at: string
}

export function ArqueoCaja() {
  const supabase = createClient()
  const { user } = useAuth()
  const { toast } = useToast()

  const [saldoInicial, setSaldoInicial] = useState<number>(0)
  const [ventasEfectivo, setVentasEfectivo] = useState<number>(0)
  const [gastosEfectivo, setGastosEfectivo] = useState<number>(0)
  const [comentarios, setComentarios] = useState<string>("")
  const [arqueos, setArqueos] = useState<ArqueoCajaEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const saldoFinal = saldoInicial + ventasEfectivo - gastosEfectivo
  const diferencia = saldoFinal - saldoInicial // Esto podría ser el monto esperado vs el contado

  useEffect(() => {
    if (user) {
      fetchArqueos()
    }
  }, [user])

  const fetchArqueos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("arqueo_caja")
      .select("*")
      .eq("user_id", user?.id)
      .order("fecha", { ascending: false })
      .limit(10) // Fetch last 10 entries

    if (error) {
      toast({
        title: "Error al cargar arqueos",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setArqueos(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para registrar un arqueo.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    const { data, error } = await supabase.from("arqueo_caja").insert({
      user_id: user.id,
      fecha: format(new Date(), "yyyy-MM-dd"),
      saldo_inicial: saldoInicial,
      ventas_efectivo: ventasEfectivo,
      gastos_efectivo: gastosEfectivo,
      saldo_final: saldoFinal,
      diferencia: diferencia,
      comentarios: comentarios,
    })

    if (error) {
      toast({
        title: "Error al registrar arqueo",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Arqueo registrado",
        description: "El arqueo de caja ha sido guardado exitosamente.",
        variant: "default",
      })
      // Clear form and refetch
      setSaldoInicial(0)
      setVentasEfectivo(0)
      setGastosEfectivo(0)
      setComentarios("")
      fetchArqueos()
    }
    setSubmitting(false)
  }

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
          <CardTitle>Nuevo Arqueo de Caja</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="saldo-inicial">Saldo Inicial</Label>
              <Input
                id="saldo-inicial"
                type="number"
                step="0.01"
                value={saldoInicial}
                onChange={(e) => setSaldoInicial(Number.parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ventas-efectivo">Ventas en Efectivo</Label>
              <Input
                id="ventas-efectivo"
                type="number"
                step="0.01"
                value={ventasEfectivo}
                onChange={(e) => setVentasEfectivo(Number.parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gastos-efectivo">Gastos en Efectivo</Label>
              <Input
                id="gastos-efectivo"
                type="number"
                step="0.01"
                value={gastosEfectivo}
                onChange={(e) => setGastosEfectivo(Number.parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="saldo-final">Saldo Final Calculado</Label>
              <Input id="saldo-final" type="number" value={saldoFinal.toFixed(2)} readOnly disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diferencia">Diferencia</Label>
              <Input id="diferencia" type="number" value={diferencia.toFixed(2)} readOnly disabled />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="comentarios">Comentarios</Label>
              <Input id="comentarios" value={comentarios} onChange={(e) => setComentarios(e.target.value)} />
            </div>
            <Button type="submit" className="md:col-span-2" disabled={submitting}>
              {submitting ? <LoadingSpinner className="mr-2" /> : null}
              Registrar Arqueo
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Arqueos</CardTitle>
        </CardHeader>
        <CardContent>
          {arqueos.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay arqueos registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Saldo Inicial</TableHead>
                    <TableHead>Ventas Efectivo</TableHead>
                    <TableHead>Gastos Efectivo</TableHead>
                    <TableHead>Saldo Final</TableHead>
                    <TableHead>Diferencia</TableHead>
                    <TableHead>Comentarios</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arqueos.map((arqueo) => (
                    <TableRow key={arqueo.id}>
                      <TableCell>{format(new Date(arqueo.fecha), "dd/MM/yyyy", { locale: es })}</TableCell>
                      <TableCell>{arqueo.saldo_inicial.toFixed(2)}</TableCell>
                      <TableCell>{arqueo.ventas_efectivo.toFixed(2)}</TableCell>
                      <TableCell>{arqueo.gastos_efectivo.toFixed(2)}</TableCell>
                      <TableCell>{arqueo.saldo_final.toFixed(2)}</TableCell>
                      <TableCell className={arqueo.diferencia !== 0 ? "text-red-500 font-medium" : ""}>
                        {arqueo.diferencia.toFixed(2)}
                      </TableCell>
                      <TableCell>{arqueo.comentarios || "-"}</TableCell>
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
