"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportButtonProps {
  data: any[]
  filename: string
  headers?: { key: string; label: string }[] // Optional headers for CSV
}

export function ExportButton({ data, filename, headers }: ExportButtonProps) {
  const exportToCsv = () => {
    if (!data || data.length === 0) {
      alert("No hay datos para exportar.")
      return
    }

    let csvContent = ""

    // Generate headers
    if (headers) {
      csvContent += headers.map((h) => h.label).join(",") + "\n"
    } else {
      // If no headers provided, use keys from the first object
      csvContent += Object.keys(data[0]).join(",") + "\n"
    }

    // Generate rows
    data.forEach((row) => {
      const rowValues = headers
        ? headers.map((h) => {
            let value = row[h.key]
            if (typeof value === "string") {
              // Escape double quotes and wrap in quotes
              value = `"${value.replace(/"/g, '""')}"`
            } else if (value === null || value === undefined) {
              value = ""
            } else if (typeof value === "object") {
              // Stringify objects/arrays
              value = `"${JSON.stringify(value).replace(/"/g, '""')}"`
            }
            return value
          })
        : Object.values(row).map((value) => {
            if (typeof value === "string") {
              return `"${value.replace(/"/g, '""')}"`
            } else if (value === null || value === undefined) {
              return ""
            } else if (typeof value === "object") {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`
            }
            return value
          })

      csvContent += rowValues.join(",") + "\n"
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${filename}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Button onClick={exportToCsv} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Exportar CSV
    </Button>
  )
}
