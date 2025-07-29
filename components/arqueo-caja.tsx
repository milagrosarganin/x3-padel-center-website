"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCashRegisterMovements } from "@/hooks/use-cash-register-movements"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LoadingSpinner } from "./loading-spinner"

export function ArqueoCaja() {
  const { movements, addMovement, loading, error } = useCashRegisterMovements()
  const { toast } = useToast()

  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [movementType, setMovementType] = useState<"initial_balance" | "deposit" | "withdrawal" | "closing_balance">(
    "deposit",
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !movementType) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    const parsedAmount = Number.parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser un número positivo.",
        variant: "destructive",
      })
      return
    }

    try {
      await addMovement({
        amount: parsedAmount,
        description,
        movement_type: movementType,
      })
      toast({
        title: "Movimiento registrado",
        description: "El movimiento de caja se ha registrado exitosamente.",
      })
      setAmount("")
      setDescription("")
      setMovementType("deposit")
    } catch (err: any) {
      toast({
        title: "Error al registrar movimiento",
        description: err.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="ml-2">Cargando movimientos de caja...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        <p>Error al cargar movimientos de caja: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">Registrar Nuevo Movimiento</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="movement-type">Tipo de Movimiento</Label>
            <Select value={movementType} onValueChange={(value: typeof movementType) => setMovementType(value)}>
              <SelectTrigger id="movement-type">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial_balance">Saldo Inicial</SelectItem>
                <SelectItem value="deposit">Ingreso</SelectItem>
                <SelectItem value="withdrawal">Egreso</SelectItem>
                <SelectItem value="closing_balance">Cierre de Caja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalles del movimiento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="w-full md:w-auto">
          Registrar Movimiento
        </Button>
      </form>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No hay movimientos de caja registrados.
                </TableCell>
              </TableRow>
            ) : (
              movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{format(new Date(movement.movement_date), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                  <TableCell>{movement.movement_type}</TableCell>
                  <TableCell className={movement.movement_type === "withdrawal" ? "text-red-500" : "text-green-500"}>
                    ${movement.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{movement.description || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
