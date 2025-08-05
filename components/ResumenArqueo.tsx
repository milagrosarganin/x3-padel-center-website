"use client"

import { useMovimientosCaja } from "@/hooks/use-movimientos-caja"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LoadingSpinner } from "@/components/loading-spinner"

export function ResumenArqueo() {
  const { movimientos, loading, error } = useMovimientosCaja()

  const ultimoArqueo = movimientos.length > 0 ? movimientos[0] : null

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner />
        <p className="ml-2">Cargando resumen de arqueo...</p>
      </div>
    )
  }

  if (error || !ultimoArqueo) {
    return (
      <div className="p-4 text-red-500">
        <p>{error ? error.message : "No hay arqueos registrados aún."}</p>
      </div>
    )
  }

  const {
    fecha,
    saldoInicial,
    saldoFinal,
    diferencia,
    ventasEfectivo,
    ventasTarjeta,
    ventasTransferencia,
    ventasOtro,
    gastosEfectivo,
    gastosTarjeta,
    gastosTransferencia,
    gastosOtro,
    comentarios,
  } = ultimoArqueo as any

  const totalVentas = ventasEfectivo + ventasTarjeta + ventasTransferencia + ventasOtro
  const totalGastos = gastosEfectivo + gastosTarjeta + gastosTransferencia + gastosOtro

  return (
    <Card className="w-full max-w-3xl mx-auto p-6">
      <CardContent className="grid gap-4">
        <h2 className="text-xl font-semibold">Resumen del Último Arqueo</h2>
        <div className="grid grid-cols-2 gap-2">
          <div><strong>Fecha:</strong> {format(new Date(fecha), "dd/MM/yyyy", { locale: es })}</div>
          <div><strong>Diferencia:</strong> ${diferencia.toFixed(2)}</div>
          <div><strong>Saldo Inicial:</strong> ${saldoInicial.toFixed(2)}</div>
          <div><strong>Saldo Final:</strong> ${saldoFinal.toFixed(2)}</div>
        </div>

        <h3 className="mt-4 font-semibold">Ventas</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>Efectivo: ${ventasEfectivo.toFixed(2)}</div>
          <div>Tarjeta: ${ventasTarjeta.toFixed(2)}</div>
          <div>Transferencia: ${ventasTransferencia.toFixed(2)}</div>
          <div>Otro: ${ventasOtro.toFixed(2)}</div>
          <div className="col-span-2 font-medium">Total: ${totalVentas.toFixed(2)}</div>
        </div>

        <h3 className="mt-4 font-semibold">Gastos</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>Efectivo: ${gastosEfectivo.toFixed(2)}</div>
          <div>Tarjeta: ${gastosTarjeta.toFixed(2)}</div>
          <div>Transferencia: ${gastosTransferencia.toFixed(2)}</div>
          <div>Otro: ${gastosOtro.toFixed(2)}</div>
          <div className="col-span-2 font-medium">Total: ${totalGastos.toFixed(2)}</div>
        </div>

        {comentarios && (
          <div className="mt-4">
            <strong>Comentarios:</strong> {comentarios}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
