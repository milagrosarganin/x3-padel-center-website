"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ExportButtonProps {
  data: any[]
  filename: string
  type?: "ventas" | "stock" | "gastos" | "proveedores"
}

export function ExportButton({ data, filename, type = "ventas" }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const exportToCSV = () => {
    setLoading(true)
    try {
      let headers: string[] = []
      let rows: string[][] = []

      switch (type) {
        case "ventas":
          headers = ["ID", "Fecha", "Hora", "Mesa", "Total", "Método", "Estado"]
          rows = data.map((item) => [
            item.id.toString(),
            item.fecha,
            item.hora,
            item.mesa,
            item.total.toString(),
            item.metodoPago,
            item.estado,
          ])
          break
        case "stock":
          headers = ["Producto", "Categoría", "Stock", "Stock Mín.", "Precio", "Proveedor"]
          rows = data.map((item) => [
            item.nombre,
            item.categoria,
            item.stock.toString(),
            item.stock_minimo.toString(),
            item.precio.toString(),
            item.proveedor,
          ])
          break
        case "gastos":
          headers = ["Fecha", "Concepto", "Categoría", "Monto", "Método", "Proveedor"]
          rows = data.map((item) => [
            item.fecha,
            item.concepto,
            item.categoria,
            item.monto.toString(),
            item.metodoPago,
            item.proveedor || "",
          ])
          break
        case "proveedores":
          headers = ["Nombre", "Contacto", "Teléfono", "Email", "Estado"]
          rows = data.map((item) => [item.nombre, item.contacto, item.telefono, item.email, item.estado])
          break
      }

      const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${filename}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Exportación exitosa",
        description: `Archivo ${filename}.csv descargado correctamente`,
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Error en la exportación",
        description: "No se pudo exportar el archivo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = () => {
    toast({
      title: "Función en desarrollo",
      description: "La exportación a PDF estará disponible próximamente",
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          {loading ? "Exportando..." : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar a CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar a PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
