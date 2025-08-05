"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export default function ArqueoCaja() {
  const supabase = createClient()
  const { user } = useAuth()

  const [arqueoAbierto, setArqueoAbierto] = useState<any>(null)
  const [saldoInicial, setSaldoInicial] = useState("")
  const [comentario, setComentario] = useState("")
  const [loading, setLoading] = useState(false)

  const paymentMethodLabels: Record<string, string> = {
    Efectivo: "Efectivo",
    Tarjeta: "Tarjeta",
    Transferencia: "Transferencia",
    Otro: "Otro",
  }

  // Usamos las llaves del objeto de etiquetas como la fuente de verdad para los medios de pago.
  // Esto asegura consistencia con el componente Mostrador.
  const medios = Object.keys(paymentMethodLabels)

  const [ventasTotales, setVentasTotales] = useState<any>({})
  const [gastosTotales, setGastosTotales] = useState<any>({})

  // 1. Cargar arqueo abierto si hay
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

  // 2. Cargar ventas y gastos para ese usuario
  const fetchVentasYGastos = async () => {
    if (!user || !arqueoAbierto) return

    const { data: ventas } = await supabase
      .from("ventas")
      .select("metodo_pago, total")
      .eq("user_id", user.id)
      .gte("created_at", arqueoAbierto.fecha_apertura)

    const { data: movimientos } = await supabase
      .from("movimientos_caja")
      .select("tipo, amount")
      .eq("user_id", user.id)
      .gte("created_at", arqueoAbierto.fecha_apertura)

    const ventasSum = Object.fromEntries(medios.map((m) => [m, 0]))
    ventas?.forEach((v) => {
      const metodo = v.metodo_pago || "cash" // Corregido para usar 'cash' como default
      ventasSum[metodo] = (ventasSum[metodo] || 0) + v.total
    })

    const gastosSum = Object.fromEntries(medios.map((m) => [m, 0]))
    movimientos?.forEach((m) => {
      if (m.tipo === "Egreso") {
        // Asumimos que todos los gastos son en efectivo por ahora
        gastosSum["cash"] += m.amount
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

  // 3. Iniciar arqueo
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
  }

  // 4. Finalizar arqueo
  const finalizarArqueo = async () => {
    setLoading(true)
    try {
      const diferencia = parseFloat(saldoInicial || "0") +
        (Object.values(ventasTotales) as number[]).reduce((a, b) => a + b, 0) -
        (Object.values(gastosTotales) as number[]).reduce((a, b) => a + b, 0)

      const { error } = await supabase
        .from("arqueo_caja")
        .update({
          fecha_cierre: new Date().toISOString(),
          saldo_final: null,
          diferencia,
          ...Object.fromEntries(
            medios.map((m) => [`ventas_${m}`, ventasTotales[m] || 0])
          ),
          ...Object.fromEntries(
            medios.map((m) => [`gastos_${m}`, gastosTotales[m] || 0])
          ),
        })
        .eq("id", arqueoAbierto.id)

      if (error) throw error

      setArqueoAbierto(null)
      toast({ title: "Arqueo finalizado" })
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error al finalizar arqueo", description: err.message })
    } finally {
      setLoading(false)
    }
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

            <Button
              onClick={finalizarArqueo}
              variant="destructive"
              disabled={loading}
            >
              Finalizar Arqueo
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
