"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { utils, writeFile } from "xlsx"

interface ExportButtonProps<T> {
  data: T[]
  headers: { key: keyof T; label: string }[]
  filename: string
}

export function ExportButton<T>({ data, headers, filename }: ExportButtonProps<T>) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      console.warn("No data to export.")
      return
    }

    // Map data to include only specified headers and their labels
    const formattedData = data.map((row) => {
      const newRow: { [key: string]: any } = {}
      headers.forEach((header) => {
        newRow[header.label] = row[header.key]
      })
      return newRow
    })

    const ws = utils.json_to_sheet(formattedData)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, "Data")
    writeFile(wb, `${filename}.xlsx`)
  }

  return (
    <Button onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Exportar a Excel
    </Button>
  )
}
