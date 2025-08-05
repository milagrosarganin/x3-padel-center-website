"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useExpenses } from "@/hooks/use-expenses"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ExportButton } from "@/components/export-button"

export function Gastos() {
  const { expenses, addExpense, loading, error } = useExpenses()
  const { toast } = useToast()

  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount) {
      toast({
        title: "Error",
        description: "Por favor, completa la descripción y el monto.",
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
      await addExpense({
        description,
        amount: parsedAmount,
        category: category || null,
      })
      toast({
        title: "Gasto registrado",
        description: "El gasto se ha registrado exitosamente.",
      })
      setDescription("")
      setAmount("")
      setCategory("")
    } catch (err: any) {
      toast({
        title: "Error al registrar gasto",
        description: err.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    }
  }

  const expenseHeaders = [
    { key: "fecha", label: "Fecha" },
    { key: "description", label: "Descripción" },
    { key: "amount", label: "Monto" },
    { key: "category", label: "Categoría" },
  ] as const // Use 'as const' for type inference

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="ml-2">Cargando gastos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        <p>Error al cargar gastos: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">Registrar Nuevo Gasto</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción del gasto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
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
          <div className="space-y-2">
            <Label htmlFor="category">Categoría (opcional)</Label>
            <Input
              id="category"
              placeholder="Ej: Alquiler, Suministros"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="w-full md:w-auto">
          Registrar Gasto
        </Button>
      </form>

      <div className="rounded-lg border shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-semibold">Listado de Gastos</h3>
          <ExportButton
            data={expenses.map((exp) => ({
              ...exp,
              fecha: format(new Date(exp.fecha), "dd/MM/yyyy", { locale: es }),
              amount: exp.amount.toFixed(2),
            }))}
            headers={expenseHeaders}
            filename="gastos"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Categoría</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No hay gastos registrados.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.fecha), "dd/MM/yyyy", { locale: es })}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{expense.category || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
