export interface Producto {
  id: number
  nombre: string
  precio: number
  stock: number
  descripcion?: string
  categoria?: string
  created_at: string
  updated_at: string
}

export interface Venta {
  id: number
  producto_id: number
  cantidad: number
  precio_unitario: number
  total: number
  modo_pago: 'efectivo' | 'digital'
  fecha_venta: string
  created_at: string
}

export interface ProductoConVentas extends Producto {
  pago_efectivo: number
  pago_digital: number
} 