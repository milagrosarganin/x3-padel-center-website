"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface Arqueo {
  id: string
  fecha_apertura: string
  fecha_cierre: string
  saldo_inicial: number
  saldo_final: number
  diferencia: number
  comentarios: string
}

export default function HistorialArqueos() {
  const { user } = useAuth()
  const [arqueos, setArqueos] = useState<Arqueo[]>([])

  useEffect(() => {
    if (!user) return
    const fetchArqueos = async () => {
      const { data, error } = await supabase
        .from("arqueo_caja")
        .select("id, fecha_apertura, fecha_cierre, saldo_inicial, saldo_final, diferencia, comentarios")
        .eq("user_id", user.id)
        .not("fecha_cierre", "is", null)
        .order("fecha_apertura", { ascending: false })

      if (!error && data) setArqueos(data as Arqueo[])
    }

    fetchArqueos()
  }, [user])

  if (!arqueos.length) return null

  return (
    <Card className="mt-6">
      <CardHeader>
        <h3 className="text-lg font-semibold">Arqueos anteriores</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {arqueos.map((a) => (
          <div key={a.id} className="border p-3 rounded-md bg-muted">
            <p className="text-sm text-muted-foreground">
              Desde <strong>{new Date(a.fecha_apertura).toLocaleString()}</strong> hasta <strong>{new Date(a.fecha_cierre).toLocaleString()}</strong>
            </p>
            <p className="text-sm">Saldo inicial: ${a.saldo_inicial}</p>
            <p className="text-sm">Saldo final: ${a.saldo_final}</p>
            <p className="text-sm">Diferencia: ${a.diferencia}</p>
            <p className="text-sm italic text-muted-foreground">Comentario: {a.comentarios || "(Sin comentario)"}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
