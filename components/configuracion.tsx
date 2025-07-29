"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"
import { LoadingSpinner } from "./loading-spinner"
import { useTheme } from "next-themes"

export function Configuracion() {
  const { user, loading: authLoading, fetchUser } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "")
  const [businessName, setBusinessName] = useState(user?.user_metadata?.business_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [isSaving, setIsSaving] = useState(false)

  // Update state when user object changes (e.g., after initial load or re-fetch)
  useState(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "")
      setBusinessName(user.user_metadata?.business_name || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { data, error } = await supabase.auth.updateUser({
        email: email,
        data: {
          full_name: fullName,
          business_name: businessName,
        },
      })

      if (error) {
        throw error
      }

      // If email was changed, Supabase sends a confirmation email.
      // The user object might not update immediately until confirmed.
      if (data.user?.email !== user?.email) {
        toast({
          title: "Perfil actualizado",
          description: "Tu perfil ha sido actualizado. Si cambiaste tu email, por favor confírmalo.",
        })
      } else {
        toast({
          title: "Perfil actualizado",
          description: "Tu perfil ha sido actualizado exitosamente.",
        })
      }
      await fetchUser() // Re-fetch user to ensure local state is in sync
    } catch (error: any) {
      toast({
        title: "Error al actualizar perfil",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <p className="ml-2">Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleUpdateProfile} className="grid gap-4 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">Información del Perfil</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full-name">Nombre Completo</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre completo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-name">Nombre del Negocio</Label>
            <Input
              id="business-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Nombre de tu negocio"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>
        <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
          {isSaving ? <LoadingSpinner className="mr-2" /> : null}
          Guardar Cambios
        </Button>
      </form>

      <div className="grid gap-4 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">Apariencia</h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode">Modo Oscuro</Label>
          <Switch
            id="dark-mode"
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
      </div>
    </div>
  )
}
