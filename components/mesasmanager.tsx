"use client"

import { useState } from "react"
import { useMesas, type Mesa } from "@/hooks/useMesas"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Pencil, Check, X, Trash2, DoorOpen, DoorClosed } from "lucide-react"

type Props = {
  /** opcional: te aviso cuando el usuario selecciona una mesa */
  onSelectMesa?: (mesa: Mesa) => void
}

export default function MesasManager({ onSelectMesa }: Props) {
  const { mesas, loading, error, crearMesa, renombrarMesa, cambiarEstadoMesa, borrarMesa } = useMesas()
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [nota, setNota] = useState("")

  const handleCrear = async () => {
    const nombre = nuevoNombre.trim()
    if (!nombre) return
    await crearMesa(nombre)
    setNuevoNombre("")
  }

  const empezarEditar = (m: Mesa) => {
    setEditId(m.id)
    setEditName(m.nombre)
  }

  const confirmarEditar = async () => {
    if (!editId) return
    await renombrarMesa(editId, editName.trim() || "Mesa")
    setEditId(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-xl font-semibold">Mesas</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Crear mesa */}
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Label>Nombre de la mesa</Label>
            <Input
              placeholder="Ej: Mesa 1"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCrear()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCrear} disabled={loading || !nuevoNombre.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Crear mesa
            </Button>
          </div>
        </div>

        {/* Nota opcional para tu flujo */}
        <div className="space-y-2">
          <Label>Nota (opcional)</Label>
          <Textarea
            placeholder="Escribí una nota para tu operación con mesas, si querés..."
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
        </div>

        {/* Estado */}
        {error ? (
          <p className="text-sm text-red-500">Error: {error.message}</p>
        ) : null}

        {/* Lista de mesas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mesas.map((m) => {
            const isEditing = editId === m.id
            const abierta = m.estado === "abierta"
            return (
              <div key={m.id} className="border rounded-xl p-3 flex flex-col gap-3">
                {/* Título / edición */}
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <Button size="icon" variant="secondary" onClick={() => setEditId(null)} title="Cancelar">
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="icon" onClick={confirmarEditar} title="Guardar">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{m.nombre}</p>
                      <p className={`text-xs ${abierta ? "text-green-600" : "text-muted-foreground"}`}>
                        {abierta ? "Abierta" : "Cerrada"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => empezarEditar(m)} title="Renombrar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => borrarMesa(m.id)} title="Borrar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={abierta ? "secondary" : "default"}
                    onClick={() => cambiarEstadoMesa(m.id, abierta ? "cerrada" : "abierta")}
                  >
                    {abierta ? <DoorClosed className="mr-2 h-4 w-4" /> : <DoorOpen className="mr-2 h-4 w-4" />}
                    {abierta ? "Cerrar" : "Abrir"}
                  </Button>

                  {/* “Usar” mesa en tu flujo (opcional) */}
                  {onSelectMesa ? (
                    <Button variant="outline" onClick={() => onSelectMesa(m)}>
                      Usar mesa
                    </Button>
                  ) : null}
                </div>
              </div>
            )
          })}
          {mesas.length === 0 && !loading ? (
            <div className="col-span-full text-sm text-muted-foreground">No hay mesas creadas.</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
