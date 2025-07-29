"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  History,
  Package,
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react"
import Image from "next/image"
import AuthGuard from "@/components/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import Mostrador from "@/components/mostrador"
import ArqueoCaja from "@/components/arqueo-caja"
import HistorialVentas from "@/components/historial-ventas"
import Stock from "@/components/stock"
import Proveedores from "@/components/proveedores"
import Gastos from "@/components/gastos"
import Configuracion from "@/components/configuracion"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("mostrador")
  const { user, signOut } = useAuth()

  // Datos de ejemplo para el dashboard
  const stats = {
    ventasHoy: 2450.0,
    mesasAbiertas: 3,
    stockBajo: 5,
    ventasSemana: 15680.0,
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Image src="/x3-logo.png" alt="X3 Padel Center" width={120} height={40} className="h-10 w-auto" />
                <div className="text-sm text-muted-foreground">
                  Bienvenido, {user?.user_metadata?.nombre || user?.email}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Caja Abierta
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("configuracion")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.ventasHoy.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">+12% vs ayer</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mesas Abiertas</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.mesasAbiertas}</div>
                <p className="text-xs text-muted-foreground">Comandas activas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                <Package className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{stats.stockBajo}</div>
                <p className="text-xs text-muted-foreground">Productos por reponer</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Semana</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.ventasSemana.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">+8% vs semana anterior</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="mostrador" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Mostrador
              </TabsTrigger>
              <TabsTrigger value="arqueo" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Arqueo
              </TabsTrigger>
              <TabsTrigger value="historial" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Historial
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Stock
              </TabsTrigger>
              <TabsTrigger value="proveedores" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Proveedores
              </TabsTrigger>
              <TabsTrigger value="gastos" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Gastos
              </TabsTrigger>
              <TabsTrigger value="configuracion" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Config
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mostrador">
              <Mostrador />
            </TabsContent>

            <TabsContent value="arqueo">
              <ArqueoCaja />
            </TabsContent>

            <TabsContent value="historial">
              <HistorialVentas />
            </TabsContent>

            <TabsContent value="stock">
              <Stock />
            </TabsContent>

            <TabsContent value="proveedores">
              <Proveedores />
            </TabsContent>

            <TabsContent value="gastos">
              <Gastos />
            </TabsContent>

            <TabsContent value="configuracion">
              <Configuracion />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
