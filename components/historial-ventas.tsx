"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSales } from "@/hooks/use-sales"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ExportButton } from "@/components/export-button"

export function HistorialVentas() {
  const { sales, loading, error } = useSales()
  const { toast } = useToast()

  const salesHeaders = [
    { key: "fecha", label: "Fecha" },
    { key: "total", label: "Total" },
    { key: "metodo_pago", label: "Método de Pago" },
    { key: "origen", label: "Origen" },
  ] // Use array for type inference

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="ml-2">Cargando historial de ventas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        <p>Error al cargar historial de ventas: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-semibold">Listado de Ventas</h3>
          <ExportButton
            data={sales.map((sale) => ({
              ...sale,
              fecha: format(new Date(sale.fecha), "dd/MM/yyyy HH:mm", { locale: es }),
              total: sale.total.toFixed(2),
            }))}
            headers={salesHeaders}
            filename="historial_ventas"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead>Origen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No hay ventas registradas.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{format(new Date(sale.fecha), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                  <TableCell>${sale.total.toFixed(2)}</TableCell>
                  <TableCell>{sale.metodo_pago || "-"}</TableCell>
                  <TableCell>{sale.origen || "-"}</TableCell>
                </TableRow>
              ))

            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
