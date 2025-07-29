"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LoadingSpinner } from "./loading-spinner"
import { ExportButton } from "./export-button"

interface VentaItem {
  producto_id: string
  nombre: string
  cantidad: number
  precio_unitario: number
}

interface Venta {
  id: string
  fecha: string
  total: number
  metodo_pago: string
  detalles: VentaItem[]
  created_at: string
}

export function HistorialVentas() {
  const supabase = createClient()
  const { user } = useAuth()
  const { toast } = useToast()

  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchVentas()
    }
  }, [user])

  const fetchVentas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("ventas")
      .select("*")
      .eq("user_id", user?.id)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Error al cargar ventas",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setVentas(data || [])
    }
    setLoading(false)
  }

  const exportHeaders = [
    { key: "fecha", label: "Fecha" },
    { key: "total", label: "Total" },
    { key: "metodo_pago", label: "Método de Pago" },
    { key: "detalles", label: "Detalles (Productos)" },
  ] as const

  const formatDetailsForExport = (details: VentaItem[]) => {
    return details.map((item) => `${item.nombre} (x${item.cantidad})`).join("; ")
  }

  const exportableVentas = ventas.map((venta) => ({
    ...venta,
    detalles: formatDetailsForExport(venta.detalles),
  }))

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Historial de Ventas</CardTitle>
        <ExportButton data={exportableVentas} filename="historial_ventas" headers={exportHeaders} />
      </CardHeader>
      <CardContent>
        {ventas.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay ventas registradas aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead>Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventas.map((venta) => (
                  <TableRow key={venta.id}>
                    <TableCell>{format(new Date(venta.fecha), "dd/MM/yyyy", { locale: es })}</TableCell>
                    <TableCell>{venta.total.toFixed(2)}</TableCell>
                    <TableCell>{venta.metodo_pago}</TableCell>
                    <TableCell>
                      <ul className="list-disc pl-4">
                        {venta.detalles.map((item, index) => (
                          <li key={index}>
                            {item.nombre} (x{item.cantidad}) - {item.precio_unitario.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
