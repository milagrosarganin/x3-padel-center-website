"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./use-auth"
import type { SupabaseClient } from "@supabase/supabase-js"

// Tipado del arqueo
export interface Arqueo {
  id: string
  user_id: string
  fecha_apertura: string
  fecha_cierre: string | null
  saldo_inicial: number
  saldo_final: number | null
  ventas_efectivo: number
  ventas_transferencia: number
  ventas_tarjeta: number
  ventas_cuenta_corriente: number
  ventas_qr: number
  ventas_otro: number
  descuento: number
  gastos_efectivo: number
  gastos_transferencia: number
  gastos_tarjeta: number
  gastos_qr: number
  gastos_cuenta_corriente: number
  diferencia: number
  comentarios: string
  created_at: string
}

// 🔁 Actualizar arqueo con una venta
export async function actualizarArqueoConVenta(
  supabase: SupabaseClient,
  userId: string,
  metodo_pago: string,
  total: number
) {
  try {
    const { data: arqueo, error: arqueoError } = await supabase
      .from("arqueo_caja")
      .select("id, ventas_efectivo, ventas_tarjeta, ventas_transferencia, ventas_cuenta_corriente, ventas_qr, ventas_otro")
      .eq("user_id", userId)
      .is("fecha_cierre", null)
      .single()

    if (arqueoError || !arqueo) {
      console.warn("No hay arqueo abierto para actualizar con venta:", arqueoError)
      return
    }

    const arqueoTyped = arqueo as Arqueo

    const campoMapping: Record<string, keyof Arqueo> = {
      Efectivo: "ventas_efectivo",
      Transferencia: "ventas_transferencia",
      Tarjeta: "ventas_tarjeta",
      "Cuenta Corriente": "ventas_cuenta_corriente",
      QR: "ventas_qr",
      Otro: "ventas_otro",
    }

    const campoActualizar = campoMapping[metodo_pago]
    const valorActual = Number(arqueoTyped[campoActualizar] ?? 0)

    const { error: updateError } = await supabase
      .from("arqueo_caja")
      .update({ [campoActualizar]: valorActual + total })
      .eq("id", arqueoTyped.id)

    if (updateError) {
      console.error("Error al actualizar arqueo con venta:", updateError.message)
    }

  } catch (error) {
    console.error("Error al actualizar el arqueo con venta:", error)
  }
}

// 🔻 Actualizar arqueo con un gasto
export async function actualizarArqueoConGasto(
  supabase: SupabaseClient,
  userId: string,
  metodo_pago: string,
  monto: number
) {
  try {
    const { data: arqueo, error: arqueoError } = await supabase
      .from("arqueo_caja")
      .select("id, gastos_efectivo, gastos_transferencia, gastos_tarjeta, gastos_qr, gastos_cuenta_corriente")
      .eq("user_id", userId)
      .is("fecha_cierre", null)
      .single()

    if (arqueoError || !arqueo) {
      console.warn("No hay arqueo abierto para actualizar con gasto:", arqueoError)
      return
    }

    const arqueoTyped = arqueo as Arqueo

    const campoMapping: Record<string, keyof Arqueo> = {
      Efectivo: "gastos_efectivo",
      Transferencia: "gastos_transferencia",
      Tarjeta: "gastos_tarjeta",
      QR: "gastos_qr",
      "Cuenta Corriente": "gastos_cuenta_corriente",
    }

    const campoActualizar = campoMapping[metodo_pago]
    const valorActual = Number(arqueoTyped[campoActualizar] ?? 0)

    const { error: updateError } = await supabase
      .from("arqueo_caja")
      .update({ [campoActualizar]: valorActual + monto })
      .eq("id", arqueoTyped.id)

    if (updateError) {
      console.error("Error al actualizar arqueo con gasto:", updateError.message)
    }
  } catch (error) {
    console.error("Error al actualizar el arqueo con gasto:", error)
  }
}

// 👀 Hook para obtener el arqueo abierto
export function useArqueo() {
  const { user } = useAuth()
  const userId = user?.id
  const [arqueoAbierto, setArqueoAbierto] = useState<Arqueo | null>(null)

  const fetchArqueoAbierto = useCallback(async () => {
    if (!userId) return

    const { data, error } = await supabase
      .from("arqueo_caja")
      .select("*")
      .eq("user_id", userId)
      .is("fecha_cierre", null)
      .single()

    if (error) {
      console.error("Error al obtener arqueo abierto", error)
      setArqueoAbierto(null)
    } else {
      setArqueoAbierto(data as Arqueo)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchArqueoAbierto()
    }
  }, [fetchArqueoAbierto, userId])

  return {
    arqueoAbierto,
    fetchArqueoAbierto,
  }
}

export async function cerrarArqueo(
  supabase: SupabaseClient,
  userId: string,
  saldoReal: number
) {
  try {
    const { data: arqueo, error } = await supabase
      .from("arqueo_caja")
      .select("*")
      .eq("user_id", userId)
      .is("fecha_cierre", null)
      .single()

    if (error || !arqueo) {
      console.warn("No se encontró arqueo abierto:", error)
      return
    }

    const arqueoTyped = arqueo as Arqueo

    const totalVentas =
      arqueoTyped.ventas_efectivo +
      arqueoTyped.ventas_transferencia +
      arqueoTyped.ventas_tarjeta +
      arqueoTyped.ventas_qr +
      arqueoTyped.ventas_cuenta_corriente +
      arqueoTyped.ventas_otro

    const totalGastos =
      arqueoTyped.gastos_efectivo +
      arqueoTyped.gastos_transferencia +
      arqueoTyped.gastos_tarjeta +
      arqueoTyped.gastos_qr +
      arqueoTyped.gastos_cuenta_corriente

    const saldoFinal = arqueoTyped.saldo_inicial + totalVentas - totalGastos
    const diferencia = saldoReal - saldoFinal

    const { error: updateError } = await supabase
      .from("arqueo_caja")
      .update({
        saldo_final: saldoFinal,
        diferencia: diferencia,
        fecha_cierre: new Date().toISOString(),
      })
      .eq("id", arqueoTyped.id)

    if (updateError) {
      console.error("Error al cerrar el arqueo:", updateError)
    } else {
      console.log("Arqueo cerrado correctamente.")
    }

  } catch (error) {
    console.error("Error inesperado al cerrar arqueo:", error)
  }
}