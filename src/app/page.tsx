'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, Modal, Form, Select, message, Row, Col, Statistic, Spin, Empty, Alert, Tabs, Badge } from 'antd'
import { ShoppingCartOutlined, DollarOutlined, CreditCardOutlined, LoadingOutlined, TrophyOutlined, AppleOutlined } from '@ant-design/icons'
import { supabase } from '@/lib/supabase'
import { Producto, ProductoConVentas } from '@/types'
import dayjs from 'dayjs'

const { Option } = Select

type Categoria = 'todos' | 'Bebidas' | 'Comida'

export default function Home() {
  const [productos, setProductos] = useState<ProductoConVentas[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [form] = Form.useForm()
  const [ventaLoading, setVentaLoading] = useState(false)
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [estadisticasHoy, setEstadisticasHoy] = useState({
    totalEfectivo: 0,
    totalDigital: 0,
    totalGeneral: 0
  })

  // Cargar productos con estadísticas de ventas del día
  const cargarProductos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Iniciando carga de productos...')
      
      // Verificar configuración de Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Variables de entorno de Supabase no configuradas. Verifica tu archivo .env.local')
      }
      
      console.log('Configuración de Supabase verificada')
      
      // Obtener productos
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('*')
        .order('nombre')

      if (productosError) {
        console.error('Error al obtener productos:', productosError)
        throw productosError
      }

      console.log('Productos obtenidos:', productosData?.length || 0)

      if (!productosData || productosData.length === 0) {
        setError('No se encontraron productos en la base de datos. Verifica que hayas ejecutado el script SQL.')
        setProductos([])
        return
      }

      // Obtener estadísticas de ventas del día actual por producto
      const hoy = dayjs()
      const inicioDia = hoy.startOf('day').toISOString()
      const finDia = hoy.endOf('day').toISOString()

      const { data: ventasData, error: ventasError } = await supabase
        .from('ventas')
        .select('producto_id, modo_pago, total')
        .gte('fecha_venta', inicioDia)
        .lte('fecha_venta', finDia)

      if (ventasError) {
        console.error('Error al obtener ventas:', ventasError)
        // No lanzamos error aquí, solo mostramos productos sin estadísticas
      }

      console.log('Ventas del día obtenidas:', ventasData?.length || 0)

      // Calcular totales por producto (solo del día)
      const productosConVentas = productosData.map((producto: Producto) => {
        const ventasProducto = ventasData?.filter(v => v.producto_id === producto.id) || []
        const pagoEfectivo = ventasProducto
          .filter(v => v.modo_pago === 'efectivo')
          .reduce((sum, v) => sum + v.total, 0)
        const pagoDigital = ventasProducto
          .filter(v => v.modo_pago === 'digital')
          .reduce((sum, v) => sum + v.total, 0)

        return {
          ...producto,
          pago_efectivo: pagoEfectivo,
          pago_digital: pagoDigital
        }
      })

      setProductos(productosConVentas)

      // Calcular estadísticas totales del día
      const totalEfectivo = ventasData?.filter(v => v.modo_pago === 'efectivo').reduce((sum, v) => sum + v.total, 0) || 0
      const totalDigital = ventasData?.filter(v => v.modo_pago === 'digital').reduce((sum, v) => sum + v.total, 0) || 0
      
      setEstadisticasHoy({
        totalEfectivo,
        totalDigital,
        totalGeneral: totalEfectivo + totalDigital
      })

      console.log('Productos procesados:', productosConVentas.length)
    } catch (error: unknown) {
      console.error('Error cargando productos:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los productos'
      setError(errorMessage)
      setProductos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  const handleVender = (producto: Producto) => {
    setSelectedProduct(producto)
    setModalVisible(true)
    form.resetFields()
  }

  const handleVentaSubmit = async (values: { cantidad: number; modo_pago: 'efectivo' | 'digital' }) => {
    if (!selectedProduct) return

    try {
      setVentaLoading(true)

      const { cantidad, modo_pago } = values
      const total = cantidad * selectedProduct.precio

      // Verificar stock
      if (cantidad > selectedProduct.stock) {
        message.error('No hay suficiente stock disponible')
        return
      }

      // Crear la venta
      const { error: ventaError } = await supabase
        .from('ventas')
        .insert({
          producto_id: selectedProduct.id,
          cantidad,
          precio_unitario: selectedProduct.precio,
          total,
          modo_pago,
          fecha_venta: new Date().toISOString()
        })

      if (ventaError) throw ventaError

      // Actualizar stock del producto
      const { error: stockError } = await supabase
        .from('productos')
        .update({ stock: selectedProduct.stock - cantidad })
        .eq('id', selectedProduct.id)

      if (stockError) throw stockError

      message.success('Venta realizada con éxito')
      setModalVisible(false)
      cargarProductos() // Recargar productos para actualizar stock y estadísticas
    } catch (error) {
      console.error('Error realizando venta:', error)
      message.error('Error al realizar la venta')
    } finally {
      setVentaLoading(false)
    }
  }

  // Filtrar productos por categoría y búsqueda
  const productosFiltrados = productos.filter(producto => {
    const coincideCategoria = categoriaActiva === 'todos' || producto.categoria === categoriaActiva
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                             (producto.descripcion && producto.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    
    return coincideCategoria && coincideBusqueda
  })

  // Contar productos por categoría
  const contarProductosPorCategoria = (categoria: Categoria) => {
    if (categoria === 'todos') return productos.length
    return productos.filter(p => p.categoria === categoria).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Administrador de Compras - Bar</h1>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
              <p className="mt-4 text-gray-600">Cargando productos...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const items = [
    {
      key: 'todos',
      label: (
        <span>
          Todos los Productos
          <Badge count={contarProductosPorCategoria('todos')} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: null
    },
    {
      key: 'Bebidas',
      label: (
        <span>
          <TrophyOutlined style={{ marginRight: 4 }} />
    
          Bebidas
          <Badge count={contarProductosPorCategoria('Bebidas')} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: null
    },
    {
      key: 'Comida',
      label: (
        <span>
          <AppleOutlined style={{ marginRight: 4 }} />
          Comida
          <Badge count={contarProductosPorCategoria('Comida')} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: null
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Administrador de Compras - Bar</h1>
        
        {/* Mostrar error si existe */}
        {error && (
          <Alert
            message="Error de Conexión"
            description={error}
            type="error"
            showIcon
            className="mb-6"
            action={
              <Button size="small" onClick={cargarProductos}>
                Reintentar
              </Button>
            }
          />
        )}
        
        {/* Estadísticas del día */}
        <Card className="mb-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Estadísticas del Día - {dayjs().format('DD/MM/YYYY')}
            </h2>
          </div>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Total Ventas Efectivo (Hoy)"
                value={estadisticasHoy.totalEfectivo}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
                precision={2}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Total Ventas Digital (Hoy)"
                value={estadisticasHoy.totalDigital}
                prefix={<CreditCardOutlined />}
                valueStyle={{ color: '#1890ff' }}
                precision={2}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Total General (Hoy)"
                value={estadisticasHoy.totalGeneral}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#722ed1' }}
                precision={2}
              />
            </Col>
          </Row>
        </Card>

        {/* Filtros y Búsqueda */}
        <Card className="mb-6">
          <Row gutter={16} align="middle">
            <Col span={12}>
              <Input.Search
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                allowClear
                size="large"
              />
            </Col>
            <Col span={12}>
              <div className="text-right">
                <span className="text-gray-600">
                  {productosFiltrados.length} de {productos.length} productos
                </span>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Pestañas de Categorías */}
        <Tabs
          activeKey={categoriaActiva}
          onChange={(key) => setCategoriaActiva(key as Categoria)}
          items={items}
          className="mb-6"
        />

        {/* Lista de Productos */}
        {productosFiltrados.length === 0 ? (
          <Card>
            <Empty 
              description={
                busqueda 
                  ? `No se encontraron productos que coincidan con "${busqueda}"`
                  : error 
                    ? "Error al cargar productos" 
                    : "No hay productos disponibles en esta categoría"
              } 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <div className="products-grid">
            {productosFiltrados.map((producto) => (
              <Card
                key={producto.id}
                title={
                  <div className="flex items-center justify-between">
                    <span>{producto.nombre}</span>
                    <Badge 
                      count={producto.categoria} 
                      style={{ 
                        backgroundColor: producto.categoria === 'Bebidas' ? '#1890ff' : '#52c41a',
                        fontSize: '10px'
                      }} 
                    />
                  </div>
                }
                className="hover:shadow-lg transition-shadow product-card"
                actions={[
                  <Button
                    key="vender"
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => handleVender(producto)}
                    disabled={producto.stock === 0}
                    style={{
                      backgroundColor: producto.stock === 0 ? '#d9d9d9' : '#1890ff',
                      borderColor: producto.stock === 0 ? '#d9d9d9' : '#1890ff',
                      color: producto.stock === 0 ? '#bfbfbf' : 'white',
                      fontWeight: '500',
                      width: '50%'
                    }}
                  >
                    {producto.stock === 0 ? 'Sin Stock' : 'Vender'}
                  </Button>
                ]}
              >
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-green-600">
                    ${producto.precio.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Stock: <span className={producto.stock === 0 ? 'text-red-500' : 'text-green-500'}>
                      {producto.stock} unidades
                    </span>
                  </p>
                  {producto.descripcion && (
                    <p className="text-sm text-gray-500">{producto.descripcion}</p>
                  )}
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>Ventas Efectivo (Hoy): ${producto.pago_efectivo.toFixed(2)}</p>
                    <p>Ventas Digital (Hoy): ${producto.pago_digital.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Venta */}
        <Modal
          title={`Vender: ${selectedProduct?.nombre}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={500}
        >
          {selectedProduct && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleVentaSubmit}
              initialValues={{ cantidad: 1, modo_pago: 'efectivo' }}
            >
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p><strong>Precio:</strong> ${selectedProduct.precio.toFixed(2)}</p>
                <p><strong>Stock disponible:</strong> {selectedProduct.stock} unidades</p>
                <p><strong>Categoría:</strong> {selectedProduct.categoria}</p>
                {selectedProduct.descripcion && (
                  <p><strong>Descripción:</strong> {selectedProduct.descripcion}</p>
                )}
              </div>

              <Form.Item
                label="Cantidad"
                name="cantidad"
                rules={[
                  { required: true, message: 'Por favor ingrese la cantidad' },
                  { type: 'number', min: 1, max: selectedProduct.stock, message: `Máximo ${selectedProduct.stock} unidades` }
                ]}
              >
                <Input type="number" min={1} max={selectedProduct.stock} />
              </Form.Item>

              <Form.Item
                label="Modo de Pago"
                name="modo_pago"
                rules={[{ required: true, message: 'Por favor seleccione el modo de pago' }]}
              >
                <Select>
                  <Option value="efectivo">Efectivo</Option>
                  <Option value="digital">Digital</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={ventaLoading}
                  block
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff',
                    color: 'white',
                    fontWeight: '500',
                    height: '40px',
                    fontSize: '16px'
                  }}
                >
                  Confirmar Venta
                </Button>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </div>
  )
}
