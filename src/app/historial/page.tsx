'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, DatePicker, Row, Col, Statistic, Spin, Empty, Alert, Tag, Button } from 'antd'
import { DollarOutlined, CreditCardOutlined, ShoppingCartOutlined, CalendarOutlined, ReloadOutlined } from '@ant-design/icons'
import { supabase } from '@/lib/supabase'
import { Venta } from '@/types'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

interface VentaConProducto extends Venta {
  producto_nombre: string
  producto_precio: number
  es_ticket?: boolean
}

export default function HistorialVentas() {
  const [ventas, setVentas] = useState<VentaConProducto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fechaInicio, setFechaInicio] = useState<dayjs.Dayjs>(dayjs().startOf('day'))
  const [fechaFin, setFechaFin] = useState<dayjs.Dayjs>(dayjs().endOf('day'))

  const cargarVentas = useCallback(async (inicio?: dayjs.Dayjs, fin?: dayjs.Dayjs) => {
    try {
      setLoading(true)
      setError(null)

      const fechaInicioQuery = inicio || fechaInicio
      const fechaFinQuery = fin || fechaFin

      console.log('Cargando ventas desde:', fechaInicioQuery.format('YYYY-MM-DD'), 'hasta:', fechaFinQuery.format('YYYY-MM-DD'))

      // Obtener todas las ventas del período
      const { data: ventasData, error: ventasError } = await supabase
        .from('ventas')
        .select('*')
        .gte('fecha_venta', fechaInicioQuery.toISOString())
        .lte('fecha_venta', fechaFinQuery.toISOString())
        .order('fecha_venta', { ascending: false })

      if (ventasError) {
        console.error('Error al obtener ventas:', ventasError)
        throw ventasError
      }

      // Separar ventas de productos y tickets
      const ventasProductos = ventasData?.filter(v => !v.es_ticket && v.producto_id) || []
      const ventasTickets = ventasData?.filter(v => v.es_ticket) || []

      // Obtener información de productos para las ventas de productos
      let productosInfo: { [key: number]: { nombre: string, precio: number } } = {}
      
      if (ventasProductos.length > 0) {
        const productoIds = [...new Set(ventasProductos.map(v => v.producto_id!))]
        
        const { data: productosData, error: productosError } = await supabase
          .from('productos')
          .select('id, nombre, precio')
          .in('id', productoIds)

        if (!productosError && productosData) {
          productosInfo = productosData.reduce((acc, producto) => {
            acc[producto.id] = { nombre: producto.nombre, precio: producto.precio }
            return acc
          }, {} as { [key: number]: { nombre: string, precio: number } })
        }
      }

      // Combinar y transformar todos los datos
      const ventasConProducto = ventasData?.map(venta => {
        if (venta.es_ticket) {
          return {
            ...venta,
            producto_nombre: 'Entrada para Show',
            producto_precio: venta.precio_unitario
          }
        } else {
          const productoInfo = productosInfo[venta.producto_id!]
          return {
            ...venta,
            producto_nombre: productoInfo ? productoInfo.nombre : 'Producto no encontrado',
            producto_precio: productoInfo ? productoInfo.precio : venta.precio_unitario
          }
        }
      }) || []

      setVentas(ventasConProducto)
      console.log('Ventas cargadas:', ventasConProducto.length)

    } catch (error: unknown) {
      console.error('Error cargando ventas:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el historial de ventas'
      setError(errorMessage)
      setVentas([])
    } finally {
      setLoading(false)
    }
  }, [fechaInicio, fechaFin])

  useEffect(() => {
    cargarVentas()
  }, [cargarVentas])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFechaChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFechaInicio(dates[0].startOf('day'))
      setFechaFin(dates[1].endOf('day'))
      cargarVentas(dates[0].startOf('day'), dates[1].endOf('day'))
    }
  }

  const handleHoy = () => {
    const hoy = dayjs()
    setFechaInicio(hoy.startOf('day'))
    setFechaFin(hoy.endOf('day'))
    cargarVentas(hoy.startOf('day'), hoy.endOf('day'))
  }

  const handleAyer = () => {
    const ayer = dayjs().subtract(1, 'day')
    setFechaInicio(ayer.startOf('day'))
    setFechaFin(ayer.endOf('day'))
    cargarVentas(ayer.startOf('day'), ayer.endOf('day'))
  }

  const handleEstaSemana = () => {
    const inicioSemana = dayjs().startOf('week')
    const finSemana = dayjs().endOf('week')
    setFechaInicio(inicioSemana)
    setFechaFin(finSemana)
    cargarVentas(inicioSemana, finSemana)
  }

  const handleEsteMes = () => {
    const inicioMes = dayjs().startOf('month')
    const finMes = dayjs().endOf('month')
    setFechaInicio(inicioMes)
    setFechaFin(finMes)
    cargarVentas(inicioMes, finMes)
  }

  // Calcular estadísticas
  const totalVentasEfectivo = ventas.filter(v => v.modo_pago === 'efectivo').reduce((sum, v) => sum + v.total, 0)
  const totalVentasDigital = ventas.filter(v => v.modo_pago === 'digital').reduce((sum, v) => sum + v.total, 0)
  const totalVentas = totalVentasEfectivo + totalVentasDigital
  const cantidadVentas = ventas.length
  const cantidadProductos = ventas.filter(v => !v.es_ticket).reduce((sum, v) => sum + v.cantidad, 0)
  const cantidadTickets = ventas.filter(v => v.es_ticket).reduce((sum, v) => sum + v.cantidad, 0)

  // Configurar columnas de la tabla
  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fecha_venta',
      key: 'fecha_venta',
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm'),
      sorter: (a: VentaConProducto, b: VentaConProducto) => dayjs(a.fecha_venta).unix() - dayjs(b.fecha_venta).unix(),
    },
    {
      title: 'Producto',
      dataIndex: 'producto_nombre',
      key: 'producto_nombre',
      render: (nombre: string) => <strong>{nombre}</strong>,
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      render: (cantidad: number) => <Tag color="blue">{cantidad}</Tag>,
    },
    {
      title: 'Precio Unit.',
      dataIndex: 'precio_unitario',
      key: 'precio_unitario',
      render: (precio: number) => `$${precio.toFixed(2)}`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => <strong className="text-green-600">${total.toFixed(2)}</strong>,
      sorter: (a: VentaConProducto, b: VentaConProducto) => a.total - b.total,
    },
    {
      title: 'Modo Pago',
      dataIndex: 'modo_pago',
      key: 'modo_pago',
      render: (modo: string) => (
        <Tag color={modo === 'efectivo' ? 'green' : 'blue'}>
          {modo === 'efectivo' ? 'Efectivo' : 'Digital'}
        </Tag>
      ),
      filters: [
        { text: 'Efectivo', value: 'efectivo' },
        { text: 'Digital', value: 'digital' },
      ],
      onFilter: (value: boolean | React.Key, record: VentaConProducto) => record.modo_pago === value,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Historial de Ventas</h1>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Spin size="large" />
              <p className="mt-4 text-gray-600">Cargando historial...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Historial de Ventas</h1>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => cargarVentas()}
            loading={loading}
            style={{
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
              color: 'white',
              fontWeight: '500'
            }}
          >
            Actualizar
          </Button>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        {/* Filtros de fecha */}
        <Card className="mb-6">
          <Row gutter={16} align="middle">
            <Col span={12}>
              <RangePicker
                value={[fechaInicio, fechaFin]}
                onChange={handleFechaChange}
                format="DD/MM/YYYY"
                placeholder={['Fecha inicio', 'Fecha fin']}
                size="large"
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <div className="flex gap-2">
                <Button 
                  onClick={handleHoy} 
                  type={dayjs().isSame(fechaInicio, 'day') ? 'primary' : 'default'}
                  style={{
                    backgroundColor: dayjs().isSame(fechaInicio, 'day') ? '#1890ff' : '#ffffff',
                    borderColor: dayjs().isSame(fechaInicio, 'day') ? '#1890ff' : '#d9d9d9',
                    color: dayjs().isSame(fechaInicio, 'day') ? 'white' : '#000000',
                    fontWeight: '500'
                  }}
                >
                  Hoy
                </Button>
                <Button 
                  onClick={handleAyer} 
                  type={dayjs().subtract(1, 'day').isSame(fechaInicio, 'day') ? 'primary' : 'default'}
                  style={{
                    backgroundColor: dayjs().subtract(1, 'day').isSame(fechaInicio, 'day') ? '#1890ff' : '#ffffff',
                    borderColor: dayjs().subtract(1, 'day').isSame(fechaInicio, 'day') ? '#1890ff' : '#d9d9d9',
                    color: dayjs().subtract(1, 'day').isSame(fechaInicio, 'day') ? 'white' : '#000000',
                    fontWeight: '500'
                  }}
                >
                  Ayer
                </Button>
                <Button 
                  onClick={handleEstaSemana} 
                  type={dayjs().startOf('week').isSame(fechaInicio, 'day') ? 'primary' : 'default'}
                  style={{
                    backgroundColor: dayjs().startOf('week').isSame(fechaInicio, 'day') ? '#1890ff' : '#ffffff',
                    borderColor: dayjs().startOf('week').isSame(fechaInicio, 'day') ? '#1890ff' : '#d9d9d9',
                    color: dayjs().startOf('week').isSame(fechaInicio, 'day') ? 'white' : '#000000',
                    fontWeight: '500'
                  }}
                >
                  Esta Semana
                </Button>
                <Button 
                  onClick={handleEsteMes} 
                  type={dayjs().startOf('month').isSame(fechaInicio, 'day') ? 'primary' : 'default'}
                  style={{
                    backgroundColor: dayjs().startOf('month').isSame(fechaInicio, 'day') ? '#1890ff' : '#ffffff',
                    borderColor: dayjs().startOf('month').isSame(fechaInicio, 'day') ? '#1890ff' : '#d9d9d9',
                    color: dayjs().startOf('month').isSame(fechaInicio, 'day') ? 'white' : '#000000',
                    fontWeight: '500'
                  }}
                >
                  Este Mes
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Estadísticas */}
        <Row gutter={16} className="mb-8">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Ventas Efectivo"
                value={totalVentasEfectivo}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
                precision={2}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Ventas Digital"
                value={totalVentasDigital}
                prefix={<CreditCardOutlined />}
                valueStyle={{ color: '#1890ff' }}
                precision={2}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total General"
                value={totalVentas}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#722ed1' }}
                precision={2}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Cantidad de Ventas"
                value={cantidadVentas}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabla de ventas */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Ventas del {fechaInicio.format('DD/MM/YYYY')} al {fechaFin.format('DD/MM/YYYY')}
            </h3>
            <p className="text-gray-600">
              {cantidadVentas} ventas • {cantidadProductos} productos • {cantidadTickets} entradas • ${totalVentas.toFixed(2)} total
            </p>
          </div>

          {ventas.length === 0 ? (
            <Empty 
              description="No hay ventas en el período seleccionado" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={ventas}
              rowKey="id"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} ventas`,
              }}
              scroll={{ x: 800 }}
            />
          )}
        </Card>
      </div>
    </div>
  )
} 