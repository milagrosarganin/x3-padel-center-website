"use client"

import type React from "react"
import { Trash2 } from "lucide-react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSuppliers } from "@/hooks/use-suppliers"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"

export function Proveedores() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, loading, error } = useSuppliers()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null)

  const resetForm = () => {
    setName("")
    setContactPerson("")
    setPhone("")
    setEmail("")
    setAddress("")
    setEditingSupplierId(null)
  }

  const handleEdit = (supplier: (typeof suppliers)[0]) => {
    setEditingSupplierId(supplier.id)
    setName(supplier.name)
    setContactPerson(supplier.contact_person || "")
    setPhone(supplier.phone || "")
    setEmail(supplier.email || "")
    setAddress(supplier.address || "")
  }

  const handleDelete = async (supplierId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este proveedor?")) {
      return
    }
    try {
      await deleteSupplier(supplierId)
      toast({
        title: "Proveedor eliminado",
        description: "El proveedor se ha eliminado exitosamente.",
      })
    } catch (err: any) {
      toast({
        title: "Error al eliminar",
        description: err.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      toast({
        title: "Error",
        description: "El nombre del proveedor es requerido.",
        variant: "destructive",
      })
      return
    }

    const supplierData = {
      name,
      contact_person: contactPerson || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
    }

    try {
      if (editingSupplierId) {
        await updateSupplier(editingSupplierId, supplierData)
        toast({
          title: "Proveedor actualizado",
          description: "El proveedor se ha actualizado exitosamente.",
        })
      } else {
        await addSupplier(supplierData)
        toast({
          title: "Proveedor registrado",
          description: "El proveedor se ha registrado exitosamente.",
        })
      }
      resetForm()
    } catch (err: any) {
      toast({
        title: `Error al ${editingSupplierId ? "actualizar" : "registrar"} proveedor`,
        description: err.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="ml-2">Cargando proveedores...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        <p>Error al cargar proveedores: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">{editingSupplierId ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Proveedor</Label>
            <Input
              id="name"
              placeholder="Nombre de la empresa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-person">Persona de Contacto (opcional)</Label>
            <Input
              id="contact-person"
              placeholder="Nombre del contacto"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Ej: +54 9 11 1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="contacto@proveedor.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Dirección (opcional)</Label>
            <Textarea
              id="address"
              placeholder="Dirección completa del proveedor"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="w-full md:w-auto">
            {editingSupplierId ? "Actualizar Proveedor" : "Registrar Proveedor"}
          </Button>
          {editingSupplierId && (
            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
          )}
        </div>
      </form>

      <div className="rounded-lg border shadow-sm">
        <h3 className="p-4 text-lg font-semibold">Listado de Proveedores</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hay proveedores registrados.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_person || "-"}</TableCell>
                  <TableCell>{supplier.phone || "-"}</TableCell>
                  <TableCell>{supplier.email || "-"}</TableCell>
                  <TableCell>{supplier.address || "-"}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(supplier.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
