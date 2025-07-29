"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Bell, Printer, Database, Shield, Palette, Save, RefreshCw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Configuracion() {
  const [configuracion, setConfiguracion] = useState({
    // Configuración General
    nombreNegocio: "X3 Padel Center",
    direccion: "Av. Libertador 1234, CABA",
    telefono: "+54 11 1234-5678",
    email: "info@x3padelcenter.com",

    // Configuración de Caja
    montoInicialCaja: 5000,
    alertaStockMinimo: true,
    stockMinimoGlobal: 10,

    // Configuración de Impresión
    imprimirTickets: true,
    impresora: "Epson TM-T20",
    formatoTicket: "80mm",

    // Configuración de Notificaciones
    notificacionesEmail: true,
    notificacionesStockBajo: true,
    notificacionesCierreCaja: true,

    // Configuración de Seguridad
    tiempoSesion: 480, // minutos
    backupAutomatico: true,
    frecuenciaBackup: "diario",

    // Configuración de Interfaz
    tema: "claro",
    idioma: "es",
    moneda: "ARS",
  })

  const [guardando, setGuardando] = useState(false)

  const handleSave = async () => {
    setGuardando(true)
    // Simular guardado
    setTimeout(() => {
      setGuardando(false)
      alert("Configuración guardada exitosamente")
    }, 1000)
  }

  const handleReset = () => {
    if (confirm("¿Estás seguro de que quieres restaurar la configuración por defecto?")) {
      // Restaurar configuración por defecto
      alert("Configuración restaurada")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          <Button onClick={handleSave} disabled={guardando}>
            <Save className="h-4 w-4 mr-2" />
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombreNegocio">Nombre del Negocio</Label>
              <Input
                id="nombreNegocio"
                value={configuracion.nombreNegocio}
                onChange={(e) => setConfiguracion({ ...configuracion, nombreNegocio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                value={configuracion.direccion}
                onChange={(e) => setConfiguracion({ ...configuracion, direccion: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={configuracion.telefono}
                onChange={(e) => setConfiguracion({ ...configuracion, telefono: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={configuracion.email}
                onChange={(e) => setConfiguracion({ ...configuracion, email: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Caja */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuración de Caja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="montoInicial">Monto Inicial de Caja</Label>
              <Input
                id="montoInicial"
                type="number"
                value={configuracion.montoInicialCaja}
                onChange={(e) =>
                  setConfiguracion({ ...configuracion, montoInicialCaja: Number.parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label htmlFor="stockMinimo">Stock Mínimo Global</Label>
              <Input
                id="stockMinimo"
                type="number"
                value={configuracion.stockMinimoGlobal}
                onChange={(e) =>
                  setConfiguracion({ ...configuracion, stockMinimoGlobal: Number.parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="alertaStock">Alertas de Stock Bajo</Label>
              <Switch
                id="alertaStock"
                checked={configuracion.alertaStockMinimo}
                onCheckedChange={(checked) => setConfiguracion({ ...configuracion, alertaStockMinimo: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Impresión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Configuración de Impresión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="imprimirTickets">Imprimir Tickets</Label>
              <Switch
                id="imprimirTickets"
                checked={configuracion.imprimirTickets}
                onCheckedChange={(checked) => setConfiguracion({ ...configuracion, imprimirTickets: checked })}
              />
            </div>
            <div>
              <Label htmlFor="impresora">Impresora</Label>
              <Select
                value={configuracion.impresora}
                onValueChange={(value) => setConfiguracion({ ...configuracion, impresora: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Epson TM-T20">Epson TM-T20</SelectItem>
                  <SelectItem value="Star TSP143">Star TSP143</SelectItem>
                  <SelectItem value="Bixolon SRP-350">Bixolon SRP-350</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="formatoTicket">Formato de Ticket</Label>
              <Select
                value={configuracion.formatoTicket}
                onValueChange={(value) => setConfiguracion({ ...configuracion, formatoTicket: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="58mm">58mm</SelectItem>
                  <SelectItem value="80mm">80mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifEmail">Notificaciones por Email</Label>
              <Switch
                id="notifEmail"
                checked={configuracion.notificacionesEmail}
                onCheckedChange={(checked) => setConfiguracion({ ...configuracion, notificacionesEmail: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifStock">Alertas de Stock Bajo</Label>
              <Switch
                id="notifStock"
                checked={configuracion.notificacionesStockBajo}
                onCheckedChange={(checked) => setConfiguracion({ ...configuracion, notificacionesStockBajo: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifCierre">Notificar Cierre de Caja</Label>
              <Switch
                id="notifCierre"
                checked={configuracion.notificacionesCierreCaja}
                onCheckedChange={(checked) => setConfiguracion({ ...configuracion, notificacionesCierreCaja: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tiempoSesion">Tiempo de Sesión (minutos)</Label>
              <Input
                id="tiempoSesion"
                type="number"
                value={configuracion.tiempoSesion}
                onChange={(e) =>
                  setConfiguracion({ ...configuracion, tiempoSesion: Number.parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="backupAuto">Backup Automático</Label>
              <Switch
                id="backupAuto"
                checked={configuracion.backupAutomatico}
                onCheckedChange={(checked) => setConfiguracion({ ...configuracion, backupAutomatico: checked })}
              />
            </div>
            <div>
              <Label htmlFor="frecuenciaBackup">Frecuencia de Backup</Label>
              <Select
                value={configuracion.frecuenciaBackup}
                onValueChange={(value) => setConfiguracion({ ...configuracion, frecuenciaBackup: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diario</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Interfaz */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Interfaz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tema">Tema</Label>
              <Select
                value={configuracion.tema}
                onValueChange={(value) => setConfiguracion({ ...configuracion, tema: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claro">Claro</SelectItem>
                  <SelectItem value="oscuro">Oscuro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="idioma">Idioma</Label>
              <Select
                value={configuracion.idioma}
                onValueChange={(value) => setConfiguracion({ ...configuracion, idioma: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="moneda">Moneda</Label>
              <Select
                value={configuracion.moneda}
                onValueChange={(value) => setConfiguracion({ ...configuracion, moneda: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                  <SelectItem value="USD">Dólar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Versión:</span>
              <div>v1.0.0</div>
            </div>
            <div>
              <span className="font-medium">Último Backup:</span>
              <div>26/01/2025 - 02:00</div>
            </div>
            <div>
              <span className="font-medium">Base de Datos:</span>
              <div>PostgreSQL 15.2</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
