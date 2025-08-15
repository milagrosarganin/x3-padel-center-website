"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

interface Mesa {
  id: string
  nombre: string
}

interface SelectorMesaProps {
  onSelect: (mesaId: string | null) => void
}

export default function SelectorMesa({ onSelect }: SelectorMesaProps) {
  const supabase = createClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [selectedMesa, setSelectedMesa] = useState<string | null>(null)
  const [nuevaMesa, setNuevaMesa] = useState("")

  const fetchMesas = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from("mesas")
      .select("id, nombre")
      .eq("estado", "abierta")
      .eq("user_id", user.id)

    if (error) {
      console.error("Error al cargar las mesas:", error)
      toast({
        title: "Error al cargar mesas",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setMesas(data || [])
    }
  }, [supabase, user, toast])

  const handleCreateMesa = async () => {
    if (!nuevaMesa) return
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una mesa.",
        variant: "destructive",
      })
      return
    }

    const { data, error } = await supabase
      .from("mesas")
      .insert({ nombre: nuevaMesa, estado: "abierta", user_id: user?.id })
      .select()
      .single()

    if (!error && data) {
      setMesas((prev) => [...prev, data])
      setSelectedMesa(data.id)
      onSelect(data.id)
      setNuevaMesa("")
    }
  }

  const handleChange = (value: string) => {
    const val = value === "ninguna" ? null : value
    setSelectedMesa(val)
    onSelect(val)
  }

  useEffect(() => {
    fetchMesas()
  }, [fetchMesas])

  return (
    <div className="space-y-4">
      <div>
        <Label>Mesa</Label>
        <Select value={selectedMesa || "ninguna"} onValueChange={handleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar mesa..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ninguna">Sin mesa</SelectItem>
            {mesas.map((mesa) => (
              <SelectItem key={mesa.id} value={mesa.id}>
                {mesa.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Nueva mesa"
          value={nuevaMesa}
          onChange={(e) => setNuevaMesa(e.target.value)}
        />
        <Button type="button" onClick={handleCreateMesa}>
          Crear
        </Button>
      </div>
    </div>
  )
}
