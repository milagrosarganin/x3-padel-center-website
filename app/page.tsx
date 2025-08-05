"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import ArqueoCaja from "@/components/arqueo-caja"
import { Mostrador } from "@/components/mostrador"
import { HistorialVentas } from "@/components/historial-ventas"
import { Stock } from "@/components/stock"
import { Gastos } from "@/components/gastos"
import { Proveedores } from "@/components/proveedores"
import { Configuracion } from "@/components/configuracion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CircleUserRound, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast({
        title: "Error al cerrar sesión",
        content: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sesión cerrada",
        content: "Has cerrado sesión exitosamente.",
      })
      router.push("/login")
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-gray-950">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 dark:border-gray-800 dark:bg-gray-900 md:px-6">
        <div className="flex items-center gap-4">
          <Image src= "/x3-logo.png" alt="" width={100} height={40} priority />
          <h1 className="text-xl font-semibold">FACTURAMA</h1>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <CircleUserRound className="h-6 w-6" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.user_metadata?.full_name || user?.email || "Usuario"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Tabs defaultValue="mostrador">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="mostrador">Mostrador</TabsTrigger>
            <TabsTrigger value="arqueo-caja">Arqueo de Caja</TabsTrigger>
            <TabsTrigger value="historial-ventas">Historial de Ventas</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="gastos">Gastos</TabsTrigger>
            <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
            <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          </TabsList>
          <TabsContent value="mostrador">
            <Card>
              <CardHeader>
                <CardTitle>Mostrador</CardTitle>
                <CardDescription>Gestiona las ventas y reservas diarias.</CardDescription>
              </CardHeader>
              <CardContent>
                <Mostrador />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="arqueo-caja">
            <Card>
              <CardHeader>
                <CardTitle>Arqueo de Caja</CardTitle>
                <CardDescription>Registra los movimientos de la caja.</CardDescription>
              </CardHeader>
              <CardContent>
                <ArqueoCaja />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="historial-ventas">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Ventas</CardTitle>
                <CardDescription>Consulta el registro de todas las ventas.</CardDescription>
              </CardHeader>
              <CardContent>
                <HistorialVentas />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="stock">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Stock</CardTitle>
                <CardDescription>Administra el inventario de productos.</CardDescription>
              </CardHeader>
              <CardContent>
                <Stock />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gastos">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Gastos</CardTitle>
                <CardDescription>Registra y controla los gastos del negocio.</CardDescription>
              </CardHeader>
              <CardContent>
                <Gastos />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="proveedores">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Proveedores</CardTitle>
                <CardDescription>Administra la información de tus proveedores.</CardDescription>
              </CardHeader>
              <CardContent>
                <Proveedores />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="configuracion">
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>Ajustes generales del sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <Configuracion />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
