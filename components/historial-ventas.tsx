"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSales } from "@/hooks/use-sales"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LoadingSpinner } from "./loading-spinner"
import { ExportButton } from "./export-button"

export function HistorialVentas() {
  const { sales, loading, error } = useSales()
  const { toast } = useToast()

  const salesHeaders = [
    { key: "sale_date", label: "Fecha" },
    { key: "total_amount", label: "Total" },
    { key: "payment_method", label: "Método de Pago" },
  ] as const // Use 'as const' for type inference

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
              sale_date: format(new Date(sale.sale_date), "dd/MM/yyyy HH:mm", { locale: es }),
              total_amount: sale.total_amount.toFixed(2),
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No hay ventas registradas.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{format(new Date(sale.sale_date), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                  <TableCell>${sale.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{sale.payment_method || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
