export interface Producto {
  id: number
  nombre: string
  precio: number
  stock: number
  descripcion?: string
  categoria?: string
  es_entrada?: boolean
  created_at: string
  updated_at: string
}

export interface Venta {
  id: number
  producto_id: number | null
  cantidad: number
  precio_unitario: number
  total: number
  modo_pago: 'efectivo' | 'digital' | 'bonanza'
  fecha_venta: string
  created_at: string
  es_ticket?: boolean
}

export interface ProductoConVentas extends Producto {
  pago_efectivo: number
  pago_digital: number
}

export interface Ticket {
  id: number
  precio: number
  descripcion?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface VentaTicket {
  id: number
  cantidad: number
  precio_unitario: number
  total: number
  modo_pago: 'efectivo' | 'digital' | 'bonanza'
  fecha_venta: string
  es_ticket: boolean
  created_at: string
} 