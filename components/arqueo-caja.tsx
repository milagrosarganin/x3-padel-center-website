"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cerrarArqueo } from "@/hooks/use-arqueo"
import HistorialArqueos from "@/components/HistorialArqueos"


export default function ArqueoCaja() {
  const { user } = useAuth()

  const [arqueoAbierto, setArqueoAbierto] = useState<any>(null)
  const [saldoInicial, setSaldoInicial] = useState("")
  const [saldoReal, setSaldoReal] = useState("")
  const [comentario, setComentario] = useState("")
  const [loading, setLoading] = useState(false)

  const paymentMethodLabels: Record<string, string> = {
    Efectivo: "Efectivo",
    Tarjeta: "Tarjeta",
    Transferencia: "Transferencia",
    Cuenta: "Cuenta corriente",
    QR: "QR",
    Otro: "Otro",
  }

  const medios = Object.keys(paymentMethodLabels)

  const [ventasTotales, setVentasTotales] = useState<any>({})
  const [gastosTotales, setGastosTotales] = useState<any>({})

  const fetchArqueoAbierto = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from("arqueo_caja")
      .select("*")
      .eq("user_id", user.id)
      .is("fecha_cierre", null)
      .single()
    if (!error) {
      setArqueoAbierto(data)
    }
  }

  const fetchVentasYGastos = async () => {
    if (!user || !arqueoAbierto) return

    const { data: ventas } = await supabase
      .from("ventas")
      .select("metodo_pago, total")
      .eq("user_id", user.id)
      .gte("created_at", arqueoAbierto.fecha_apertura)

    const { data: movimientos } = await supabase
      .from("movimientos_caja")
      .select("tipo, amount, metodo_pago")
      .eq("user_id", user.id)
      .gte("created_at", arqueoAbierto.fecha_apertura)

    const ventasSum = Object.fromEntries(medios.map((m) => [m, 0]))
    ventas?.forEach((v) => {
      const metodo = v.metodo_pago || "Otro"
      ventasSum[metodo] = (ventasSum[metodo] || 0) + v.total
    })

    const gastosSum = Object.fromEntries(medios.map((m) => [m, 0]))
    movimientos?.forEach((m) => {
      if (m.tipo === "egreso") {
        const metodo = m.metodo_pago || "Efectivo"
        gastosSum[metodo] = (gastosSum[metodo] || 0) + m.amount
      }
    })

    setVentasTotales(ventasSum)
    setGastosTotales(gastosSum)
  }

  useEffect(() => {
    fetchArqueoAbierto()
  }, [user])

  useEffect(() => {
    if (arqueoAbierto) {
      fetchVentasYGastos()
      const interval = setInterval(fetchVentasYGastos, 5000)
      return () => clearInterval(interval)
    }
  }, [arqueoAbierto])

  const iniciarArqueo = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("arqueo_caja")
        .insert({
          user_id: user?.id,
          fecha_apertura: new Date().toISOString(),
          saldo_inicial: parseFloat(saldoInicial),
          comentarios: comentario,
          ...Object.fromEntries(medios.map((m) => [`ventas_${m}`, 0])),
          ...Object.fromEntries(medios.map((m) => [`gastos_${m}`, 0])),
        })
        .select()
        .single()

      if (error) throw error

      setArqueoAbierto(data)
      setSaldoInicial("")
      toast({ title: "Arqueo iniciado correctamente" })
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error al iniciar arqueo", description: err.message })
    } finally {
      setLoading(false)
    }
      if (!user) {
        toast({ title: "No hay usuario encontrado" })
        return
    }
  }

  const handleCerrarArqueo = async () => {
    setLoading(true)
    try {
            if (!user) {
        toast({ title: "Usuario no encontrado" })
        return
      }
      await cerrarArqueo(supabase, user.id, parseFloat(saldoReal || "0"))
      setArqueoAbierto(null)
      toast({ title: "Arqueo finalizado correctamente" })
    } catch (error: any) {
      console.error("Error al cerrar arqueo:", error)
      toast({ title: "Error al cerrar arqueo", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const calcularDiferencia = () => {
    const totalVentas = (Object.values(ventasTotales)as number[]).reduce((a, b) => a + b, 0)
    const totalGastos = (Object.values(gastosTotales)as number[]).reduce((a, b) => a + b, 0)
    const saldoTeorico = arqueoAbierto?.saldo_inicial + totalVentas - totalGastos
    return parseFloat(saldoReal || "0") - saldoTeorico
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <h2 className="text-xl font-bold">Arqueo de Caja</h2>
      </CardHeader>
      <CardContent>
        {!arqueoAbierto ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Saldo inicial</Label>
                <Input
                  type="number"
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(e.target.value)}
                />
              </div>
              <div>
                <Label>Comentarios</Label>
                <Textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={iniciarArqueo} disabled={loading} className="mt-4">
              Iniciar Arqueo
            </Button>
          </>
        ) : (
          <>
            <p className="mb-2 text-green-500 font-semibold">
              Arqueo abierto desde:{" "}
              {new Date(arqueoAbierto.fecha_apertura).toLocaleString()}
            </p>

            <div className="mb-4 bg-muted p-3 rounded-md w-fit">
              <p className="text-sm text-muted-foreground">Monto Inicial:</p>
              <p className="text-xl font-bold">${arqueoAbierto.saldo_inicial}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
              {medios.map((m) => (
                <div key={m}>
                  <Label>{m.toUpperCase()}</Label>
                  <p>
                    <span className="text-sm text-muted-foreground">Ventas:</span>{" "}
                    ${ventasTotales[m] || 0}
                    <br />
                    <span className="text-sm text-muted-foreground">Gastos:</span>{" "}
                    ${gastosTotales[m] || 0}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <Label>Saldo Real Contado (en caja):</Label>
              <Input
                type="number"
                value={saldoReal}
                onChange={(e) => setSaldoReal(e.target.value)}
                placeholder="Ej: 35000"
              />
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              Diferencia estimada:{" "}
              <span className="font-bold">
                ${calcularDiferencia().toFixed(2)}
              </span>
            </div>

            <Button
              onClick={handleCerrarArqueo}
              variant="destructive"
              disabled={loading}
            >
              Finalizar Arqueo
            </Button>
          </>
        )}
        <div className="mt-6">
          <Label>Historial de Arqueos</Label>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Aquí puedes ver el historial de arqueos realizados.
        </p>
        <HistorialArqueos />

      </CardContent>
    </Card>
  )
}
