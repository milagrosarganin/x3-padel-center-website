"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"
import { LoadingSpinner } from "./loading-spinner"
import { ExportButton } from "./export-button"

interface Proveedor {
  id: string
  nombre: string
  contacto: string
  telefono: string
  email: string
  created_at: string
}

export function Proveedores() {
  const supabase = createClient()
  const { toast } = useToast()

  const [nombre, setNombre] = useState("")
  const [contacto, setContacto] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProveedores()
  }, [])

  const fetchProveedores = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("proveedores").select("*").order("nombre", { ascending: true })

    if (error) {
      toast({
        title: "Error",
        description: `Error al cargar proveedores: ${error.message}`,
        variant: "destructive",
      })
    } else {
      setProveedores(data || [])
    }
    setLoading(false)
  }

  const handleAddProveedor = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { data, error } = await supabase.from("proveedores").insert({
      nombre,
      contacto,
      telefono,
      email,
    })

    if (error) {
      toast({
        title: "Error",
        description: `Error al agregar proveedor: ${error.message}`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Proveedor agregado correctamente.",
        variant: "default",
      })
      // Clear form and refetch
      setNombre("")
      setContacto("")
      setTelefono("")
      setEmail("")
      fetchProveedores()
    }
    setSubmitting(false)
  }

  const handleDeleteProveedor = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este proveedor?")) return

    setLoading(true)
    const { error } = await supabase.from("proveedores").delete().eq("id", id)
    if (error) {
      toast({
        title: "Error",
        description: `Error al eliminar proveedor: ${error.message}`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Proveedor eliminado correctamente.",
        variant: "default",
      })
      fetchProveedores()
    }
    setLoading(false)
  }

  const exportHeaders = [
    { key: "nombre", label: "Nombre" },
    { key: "contacto", label: "Contacto" },
    { key: "telefono", label: "Teléfono" },
    { key: "email", label: "Email" },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Nuevo Proveedor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddProveedor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-proveedor">Nombre</Label>
              <Input
                id="nombre-proveedor"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del proveedor"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contacto-proveedor">Contacto</Label>
              <Input
                id="contacto-proveedor"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Persona de contacto"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono-proveedor">Teléfono</Label>
              <Input
                id="telefono-proveedor"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Número de teléfono"
                type="tel"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-proveedor">Email</Label>
              <Input
                id="email-proveedor"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                type="email"
                required
              />
            </div>
            <Button type="submit" className="md:col-span-2" disabled={submitting}>
              {submitting ? <LoadingSpinner className="mr-2" /> : null}
              Agregar Proveedor
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Listado de Proveedores</CardTitle>
          <ExportButton data={proveedores} filename="listado_proveedores" headers={exportHeaders} />
        </CardHeader>
        <CardContent>
          {proveedores.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay proveedores registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proveedores.map((proveedor) => (
                    <TableRow key={proveedor.id}>
                      <TableCell>{proveedor.nombre}</TableCell>
                      <TableCell>{proveedor.contacto}</TableCell>
                      <TableCell>{proveedor.telefono}</TableCell>
                      <TableCell>{proveedor.email}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProveedor(proveedor.id)}>
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
