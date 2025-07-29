"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArqueoCaja } from "@/components/arqueo-caja"
import { Gastos } from "@/components/gastos"
import { HistorialVentas } from "@/components/historial-ventas"
import { Mostrador } from "@/components/mostrador"
import { Stock } from "@/components/stock"
import { Proveedores } from "@/components/proveedores"
import { Configuracion } from "@/components/configuracion"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { LogOut } from "lucide-react"

export default function Home() {
  const { signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("mostrador")

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-gray-950">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <Image src="/x3-logo.png" alt="X3 Padel Center Logo" width={100} height={40} priority />
          <h1 className="text-xl font-semibold">Sistema de Gestión</h1>
        </div>
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
            <TabsTrigger value="mostrador">Mostrador</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="ventas">Ventas</TabsTrigger>
            <TabsTrigger value="gastos">Gastos</TabsTrigger>
            <TabsTrigger value="arqueo">Arqueo de Caja</TabsTrigger>
            <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
            <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          </TabsList>
          <TabsContent value="mostrador">
            <Card>
              <CardHeader>
                <CardTitle>Mostrador de Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <Mostrador />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="stock">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <Stock />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ventas">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <HistorialVentas />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gastos">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <Gastos />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="arqueo">
            <Card>
              <CardHeader>
                <CardTitle>Arqueo de Caja</CardTitle>
              </CardHeader>
              <CardContent>
                <ArqueoCaja />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="proveedores">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Proveedores</CardTitle>
              </CardHeader>
              <CardContent>
                <Proveedores />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="configuracion">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
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
