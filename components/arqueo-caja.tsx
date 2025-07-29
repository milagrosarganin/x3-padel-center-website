"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calculator, DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ArqueoData {
  fecha: string
  horaApertura: string
  horaCierre?: string
  montoInicial: number
  ventasEfectivo: number
  ventasTarjeta: number
  gastos: number
  montoFinal: number
  diferencia: number
  estado: "abierta" | "cerrada"
}

export default function ArqueoCaja() {
  const [cajaActual, setCajaActual] = useState<ArqueoData>({
    fecha: new Date().toLocaleDateString("es-AR"),
    horaApertura: "09:00",
    montoInicial: 5000,
    ventasEfectivo: 2450,
    ventasTarjeta: 1800,
    gastos: 350,
    montoFinal: 0,
    diferencia: 0,
    estado: "abierta",
  })

  const [historialArqueos] = useState<ArqueoData[]>([
    {
      fecha: "25/01/2025",
      horaApertura: "09:00",
      horaCierre: "22:00",
      montoInicial: 5000,
      ventasEfectivo: 3200,
      ventasTarjeta: 2100,
      gastos: 450,
      montoFinal: 7750,
      diferencia: 0,
      estado: "cerrada",
    },
    {
      fecha: "24/01/2025",
      horaApertura: "09:00",
      horaCierre: "22:30",
      montoInicial: 5000,
      ventasEfectivo: 2800,
      ventasTarjeta: 1950,
      gastos: 320,
      montoFinal: 7480,
      diferencia: 0,
      estado: "cerrada",
    },
  ])

  const [montoContado, setMontoContado] = useState("")
  const [showCerrarCaja, setShowCerrarCaja] = useState(false)

  const montoEsperado = cajaActual.montoInicial + cajaActual.ventasEfectivo - cajaActual.gastos

  const cerrarCaja = () => {
    const montoFinalNum = Number.parseFloat(montoContado) || 0
    const diferencia = montoFinalNum - montoEsperado

    setCajaActual({
      ...cajaActual,
      montoFinal: montoFinalNum,
      diferencia,
      estado: "cerrada",
      horaCierre: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    })

    setShowCerrarCaja(false)
    setMontoContado("")
  }

  const abrirNuevaCaja = () => {
    setCajaActual({
      fecha: new Date().toLocaleDateString("es-AR"),
      horaApertura: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      montoInicial: 5000,
      ventasEfectivo: 0,
      ventasTarjeta: 0,
      gastos: 0,
      montoFinal: 0,
      diferencia: 0,
      estado: "abierta",
    })
  }

  return (
    <div className="space-y-6">
      {/* Estado de Caja Actual */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Caja del Día - {cajaActual.fecha}
          </CardTitle>
          <Badge variant={cajaActual.estado === "abierta" ? "default" : "secondary"}>
            {cajaActual.estado === "abierta" ? "Caja Abierta" : "Caja Cerrada"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Hora Apertura</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">{cajaActual.horaApertura}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Monto Inicial</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-lg font-semibold">${cajaActual.montoInicial}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Ventas Efectivo</Label>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-lg font-semibold text-green-600">${cajaActual.ventasEfectivo}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Ventas Tarjeta</Label>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-lg font-semibold text-blue-600">${cajaActual.ventasTarjeta}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Gastos</Label>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-lg font-semibold text-red-600">${cajaActual.gastos}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Monto Esperado</Label>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">${montoEsperado}</span>
              </div>
            </div>

            {cajaActual.estado === "cerrada" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Monto Final</Label>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-semibold">${cajaActual.montoFinal}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Diferencia</Label>
                  <div className="flex items-center gap-2">
                    {cajaActual.diferencia >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-lg font-semibold ${
                        cajaActual.diferencia >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ${cajaActual.diferencia}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <Separator className="my-6" />

          <div className="flex gap-4">
            {cajaActual.estado === "abierta" ? (
              <Dialog open={showCerrarCaja} onOpenChange={setShowCerrarCaja}>
                <DialogTrigger asChild>
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Cerrar Caja
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cerrar Caja del Día</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>Monto Esperado:</span>
                        <span className="font-bold">${montoEsperado}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        (Inicial: ${cajaActual.montoInicial} + Ventas: ${cajaActual.ventasEfectivo} - Gastos: $
                        {cajaActual.gastos})
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="montoContado">Monto Contado en Caja</Label>
                      <Input
                        id="montoContado"
                        type="number"
                        value={montoContado}
                        onChange={(e) => setMontoContado(e.target.value)}
                        placeholder="Ingresa el monto contado"
                      />
                    </div>

                    {montoContado && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span>Diferencia:</span>
                          <span
                            className={`font-bold ${
                              (Number.parseFloat(montoContado) - montoEsperado) >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            ${(Number.parseFloat(montoContado) - montoEsperado).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button onClick={cerrarCaja} className="w-full">
                      Confirmar Cierre de Caja
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button onClick={abrirNuevaCaja}>
                <DollarSign className="h-4 w-4 mr-2" />
                Abrir Nueva Caja
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historial de Arqueos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Arqueos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historialArqueos.map((arqueo, index) => (
              <Card key={index} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <div className="font-medium">{arqueo.fecha}</div>
                      <div className="text-sm text-muted-foreground">
                        {arqueo.horaApertura} - {arqueo.horaCierre}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Inicial</div>
                      <div className="font-medium">${arqueo.montoInicial}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Ventas</div>
                      <div className="font-medium text-green-600">${arqueo.ventasEfectivo + arqueo.ventasTarjeta}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Gastos</div>
                      <div className="font-medium text-red-600">${arqueo.gastos}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Final</div>
                      <div className="font-medium">${arqueo.montoFinal}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Diferencia</div>
                      <div className={`font-medium ${arqueo.diferencia >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${arqueo.diferencia}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
