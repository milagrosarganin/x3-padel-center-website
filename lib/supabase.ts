import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la base de datos
export interface User {
  id: string
  email: string
  nombre: string
  rol: "admin" | "empleado"
  negocio_id: string
  created_at: string
  updated_at: string
}

export interface Negocio {
  id: string
  nombre: string
  direccion: string
  telefono: string
  email: string
  created_at: string
  updated_at: string
}

export interface Venta {
  id: string
  fecha: string
  hora: string
  mesa: string
  items: Array<{
    producto_id: string // Cambiado a string para UUID
    cantidad: number
    precio: number
    subtotal: number
  }>
  total: number
  metodo_pago: "efectivo" | "tarjeta" | "transferencia"
  estado: "completada" | "cancelada"
  usuario_id: string
  negocio_id: string
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  categoria: string
  stock: number
  stock_minimo: number
  precio: number
  proveedor: string
  ultima_compra: string
  usuario_id: string
  negocio_id: string
  created_at: string
  updated_at: string
}

export interface Gasto {
  id: string
  fecha: string
  concepto: string
  categoria: string
  monto: number
  descripcion: string
  metodo_pago: "efectivo" | "tarjeta" | "transferencia"
  proveedor?: string
  comprobante?: string
  usuario_id: string
  negocio_id: string
  created_at: string
}
