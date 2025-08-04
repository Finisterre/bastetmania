'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Space, 
  Popconfirm, 
  message, 
  Spin, 
  Alert,
  Tag,
  Tooltip,
  Row,
  Col
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  ShoppingOutlined
} from '@ant-design/icons'
import { supabase } from '@/lib/supabase'
import { Producto, Ticket } from '@/types'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTicketVisible, setModalTicketVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [form] = Form.useForm()
  const [formTicket] = Form.useForm()
  const [submitLoading, setSubmitLoading] = useState(false)
  const [ticketLoading, setTicketLoading] = useState(false)

  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('*')
        .order('nombre')

      if (productosError) {
        console.error('Error al obtener productos:', productosError)
        throw productosError
      }

      setProductos(productosData || [])
      console.log('Productos cargados:', productosData?.length || 0)

    } catch (error: unknown) {
      console.error('Error cargando productos:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los productos'
      setError(errorMessage)
      setProductos([])
    } finally {
      setLoading(false)
    }
  }, [])

  const cargarTicket = useCallback(async () => {
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('activo', true)
        .single()

      if (ticketError) {
        console.error('Error al obtener ticket:', ticketError)
        return
      }

      setTicket(ticketData)
      console.log('Ticket cargado:', ticketData)

    } catch (error: unknown) {
      console.error('Error cargando ticket:', error)
    }
  }, [])

  useEffect(() => {
    cargarProductos()
    cargarTicket()
  }, [cargarProductos, cargarTicket])

  const handleAgregar = () => {
    setEditingProduct(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEditar = (producto: Producto) => {
    setEditingProduct(producto)
    form.setFieldsValue({
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      descripcion: producto.descripcion,
      categoria: producto.categoria
    })
    setModalVisible(true)
  }

  const handleEliminar = async (id: number) => {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      message.success('Producto eliminado correctamente')
      cargarProductos()
    } catch (error: unknown) {
      console.error('Error eliminando producto:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el producto'
      message.error(errorMessage)
    }
  }

  const handleEditarTicket = () => {
    if (!ticket) {
      message.error('No hay ticket disponible')
      return
    }
    console.log('Abriendo modal de edición de ticket:', ticket)
    formTicket.setFieldsValue({ 
      precio: ticket.precio,
      descripcion: ticket.descripcion || ''
    })
    setModalTicketVisible(true)
  }

  const handleTicketSubmit = async (values: { precio: number; descripcion?: string }) => {
    if (!ticket) return

    try {
      setTicketLoading(true)
      console.log('Actualizando ticket con valores:', values)

      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          precio: values.precio,
          descripcion: values.descripcion || null
        })
        .eq('id', ticket.id)

      if (updateError) {
        console.error('Error de Supabase:', updateError)
        throw updateError
      }

      message.success('Precio de entrada actualizado correctamente')
      setModalTicketVisible(false)
      cargarTicket() // Recargar información del ticket
    } catch (error) {
      console.error('Error actualizando ticket:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el ticket'
      message.error(errorMessage)
    } finally {
      setTicketLoading(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    try {
      setSubmitLoading(true)

      if (editingProduct) {
                 // Actualizar producto existente
         const { error } = await supabase
           .from('productos')
           .update({
             nombre: values.nombre,
             precio: values.precio,
             stock: values.stock,
             descripcion: values.descripcion,
             categoria: values.categoria,
             updated_at: new Date().toISOString()
           })
           .eq('id', editingProduct.id)

        if (error) {
          throw error
        }

        message.success('Producto actualizado correctamente')
      } else {
                 // Crear nuevo producto
         const { error } = await supabase
           .from('productos')
           .insert({
             nombre: values.nombre,
             precio: values.precio,
             stock: values.stock,
             descripcion: values.descripcion,
             categoria: values.categoria
           })

        if (error) {
          throw error
        }

        message.success('Producto creado correctamente')
      }

      setModalVisible(false)
      form.resetFields()
      cargarProductos()
    } catch (error: unknown) {
      console.error('Error guardando producto:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el producto'
      message.error(errorMessage)
    } finally {
      setSubmitLoading(false)
    }
  }

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (nombre: string) => <strong>{nombre}</strong>,
      sorter: (a: Producto, b: Producto) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
             render: (precio: number) => <span className="text-green-600 font-semibold">${precio.toLocaleString('es-AR')}</span>,
      sorter: (a: Producto, b: Producto) => a.precio - b.precio,
    },
         {
       title: 'Stock',
       dataIndex: 'stock',
       key: 'stock',
               render: (stock: number) => (
          <Tag color={stock === 0 ? 'red' : stock < 10 ? 'orange' : 'green'}>
            {stock} unidades
          </Tag>
        ),
       sorter: (a: Producto, b: Producto) => a.stock - b.stock,
     },
    {
      title: 'Categoría',
      dataIndex: 'categoria',
      key: 'categoria',
      render: (categoria: string) => (
        <Tag color={categoria === 'Bebidas' ? 'blue' : 'green'}>
          {categoria}
        </Tag>
      ),
      filters: [
        { text: 'Bebidas', value: 'Bebidas' },
        { text: 'Comida', value: 'Comida' },
      ],
      onFilter: (value: boolean | React.Key, record: Producto) => record.categoria === value,
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      render: (descripcion: string) => (
        <Tooltip title={descripcion}>
          <span className="truncate block max-w-xs">
            {descripcion || 'Sin descripción'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Última Actualización',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm'),
      sorter: (a: Producto, b: Producto) => dayjs(a.updated_at).unix() - dayjs(b.updated_at).unix(),
    },
    {
      title: 'Acciones',
      key: 'acciones',
             render: (_: unknown, record: Producto) => (
         <Space>
           <Tooltip title="Editar producto">
             <Button
               type="primary"
               icon={<EditOutlined />}
               size="small"
               onClick={() => handleEditar(record)}
               style={{
                 backgroundColor: '#1890ff',
                 borderColor: '#1890ff',
                 color: 'white',
                 fontWeight: '500'
               }}
             />
           </Tooltip>
           <Popconfirm
             title="¿Eliminar producto?"
             description="Esta acción no se puede deshacer. ¿Estás seguro?"
             onConfirm={() => handleEliminar(record.id)}
             okText="Sí, eliminar"
             cancelText="Cancelar"
           >
             <Tooltip title="Eliminar producto">
               <Button
                 type="primary"
                 danger
                 icon={<DeleteOutlined />}
                 size="small"
                 style={{
                   backgroundColor: '#ff4d4f',
                   borderColor: '#ff4d4f',
                   color: 'white',
                   fontWeight: '500'
                 }}
               />
             </Tooltip>
           </Popconfirm>
         </Space>
       ),
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Administrador de Productos</h1>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Spin size="large" />
              <p className="mt-4 text-gray-600">Cargando productos...</p>
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
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Administrador de Productos</h1>
            <p className="text-gray-600 mt-2">Gestiona el inventario de tu bar</p>
          </div>
          <Space>
                         <Button 
               icon={<ReloadOutlined />} 
               onClick={cargarProductos}
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
                         <Button 
               type="primary" 
               icon={<PlusOutlined />} 
               onClick={handleAgregar}
               style={{
                 backgroundColor: '#1890ff',
                 borderColor: '#1890ff',
                 color: 'white',
                 fontWeight: '500'
               }}
             >
               Agregar Producto
             </Button>
          </Space>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-6"
            action={
              <Button 
                size="small" 
                onClick={cargarProductos}
                style={{
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff',
                  color: 'white',
                  fontWeight: '500'
                }}
              >
                Reintentar
              </Button>
            }
          />
        )}

        {/* Estadísticas rápidas */}
        <Row gutter={16} className="mb-6">
          <Col span={4}>
            <Card>
              <div className="text-center">
                <ShoppingOutlined className="text-2xl text-blue-600 mb-2" />
                <div className="text-xl font-bold">{productos.length}</div>
                <div className="text-sm text-gray-600">Total Productos</div>
              </div>
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <div className="text-center">
                <div className="text-2xl text-blue-600 mb-2">🍺</div>
                <div className="text-xl font-bold">
                  {productos.filter(p => p.categoria === 'Bebidas').length}
                </div>
                <div className="text-sm text-gray-600">Bebidas</div>
              </div>
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <div className="text-center">
                <div className="text-2xl text-green-600 mb-2">🍕</div>
                <div className="text-xl font-bold">
                  {productos.filter(p => p.categoria === 'Comida').length}
                </div>
                <div className="text-sm text-gray-600">Comida</div>
              </div>
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <div className="text-center">
                <div className="text-2xl text-red-600 mb-2">⚠️</div>
                <div className="text-xl font-bold">
                  {productos.filter(p => p.stock === 0).length}
                </div>
                <div className="text-sm text-gray-600">Sin Stock</div>
              </div>
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <div className="text-center">
                <div className="text-2xl text-purple-600 mb-2">🎫</div>
                                 <div className="text-xl font-bold">
                   {ticket ? `$${ticket.precio.toLocaleString('es-AR')}` : 'N/A'}
                 </div>
                <div className="text-sm text-gray-600">Precio Entrada</div>
              </div>
            </Card>
          </Col>
        </Row>
        <Row gutter={16} className="mb-6">
          {/* Sección de Gestión de Entradas */}
          <Card className="mt-6  mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">🎫 Gestión de Entradas</h2>
              <p className="text-gray-600">Configura el precio y descripción de las entradas para eventos</p>
            </div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEditarTicket}
              disabled={!ticket}
              style={{
                backgroundColor: '#722ed1',
                borderColor: '#722ed1',
                color: 'white',
                fontWeight: '500'
              }}
            >
              Editar Entrada
            </Button>
          </div>

          {ticket ? (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Precio Actual</p>
                                     <p className="text-2xl font-bold text-purple-600">${ticket.precio.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Descripción</p>
                  <p className="text-lg font-semibold">{ticket.descripcion || 'Entrada general para el show/evento'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <Tag color={ticket.activo ? 'green' : 'red'}>
                    {ticket.activo ? 'Activo' : 'Inactivo'}
                  </Tag>
                </div>
              </div>
            </div>
          ) : (
            <Alert
              message="No hay entrada configurada"
              description="No se encontró información de entrada en la base de datos."
              type="warning"
              showIcon
            />
          )}
        </Card>
   </Row>
        {/* Tabla de productos */}
        <Card>
          <Row>
            <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
          </Row>
          <Table
            columns={columns}
            dataSource={productos}
            rowKey="id"
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

      

        {/* Modal para agregar/editar producto */}
        <Modal
          title={editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              stock: 0,
              categoria: 'Bebidas'
            }}
          >
            <Form.Item
              label="Nombre del Producto"
              name="nombre"
              rules={[
                { required: true, message: 'Por favor ingrese el nombre del producto' },
                { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
              ]}
            >
              <Input placeholder="Ej: Cerveza Corona" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Precio"
                  name="precio"
                  rules={[
                    { required: true, message: 'Por favor ingrese el precio' },
                    { 
                      validator: (_, value) => {
                        const numValue = Number(value)
                        if (isNaN(numValue) || numValue < 0) {
                          return Promise.reject(new Error('El precio debe ser mayor a 0'))
                        }
                        return Promise.resolve()
                      }
                    }
                  ]}
                >
                  <InputNumber
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    addonBefore="$"
                  />
                </Form.Item>
              </Col>
                             <Col span={12}>
                                   <Form.Item
                    label="Stock Inicial"
                    name="stock"
                    rules={[
                      { required: true, message: 'Por favor ingrese el stock' },
                      { 
                        validator: (_, value) => {
                          const numValue = Number(value)
                          if (isNaN(numValue) || numValue < 0) {
                            return Promise.reject(new Error('El stock debe ser mayor o igual a 0'))
                          }
                          return Promise.resolve()
                        }
                      }
                    ]}
                  >
                    <InputNumber
                      placeholder="0"
                      min={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
               </Col>
            </Row>

                         <Form.Item
               label="Categoría"
               name="categoria"
               rules={[{ required: true, message: 'Por favor seleccione una categoría' }]}
             >
                               <Select 
                  placeholder="Seleccionar categoría"
                >
                                   <Option value="Bebidas">Bebidas</Option>
                  <Option value="Comida">Comida</Option>
               </Select>
             </Form.Item>

            <Form.Item
              label="Descripción"
              name="descripcion"
            >
              <TextArea
                placeholder="Descripción opcional del producto..."
                rows={3}
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-2">
                <Button 
                  onClick={() => setModalVisible(false)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#d9d9d9',
                    color: '#000000',
                    fontWeight: '500'
                  }}
                >
                  Cancelar
                </Button>
                                 <Button
                   type="primary"
                   htmlType="submit"
                   loading={submitLoading}
                   style={{
                     backgroundColor: '#1890ff',
                     borderColor: '#1890ff',
                     color: 'white',
                     fontWeight: '500'
                   }}
                 >
                   {editingProduct ? 'Actualizar' : 'Crear'} Producto
                 </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal para editar ticket */}
        <Modal
          title="Editar Precio de Entrada"
          open={modalTicketVisible}
          onCancel={() => setModalTicketVisible(false)}
          footer={null}
          width={500}
        >
          <div className="mb-4 p-4 bg-purple-50 rounded">
                         <p><strong>Precio actual:</strong> ${ticket?.precio.toLocaleString('es-AR')}</p>
            <p><strong>Tipo:</strong> Entrada general</p>
            {ticket?.descripcion && (
              <p><strong>Descripción actual:</strong> {ticket.descripcion}</p>
            )}
          </div>

          <Form
            form={formTicket}
            layout="vertical"
            onFinish={handleTicketSubmit}
          >
            <Form.Item
              label="Nuevo Precio"
              name="precio"
              rules={[
                { required: true, message: 'Por favor ingrese el nuevo precio' },
                { 
                  validator: (_, value) => {
                    const numValue = Number(value)
                    if (isNaN(numValue) || numValue < 0.01) {
                      return Promise.reject(new Error('El precio debe ser mayor a 0'))
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input 
                type="number" 
                min={0.01} 
                step={0.01}
                addonBefore="$"
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              label="Descripción (Opcional)"
              name="descripcion"
            >
              <TextArea
                placeholder="Descripción de la entrada..."
                rows={3}
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-2">
                <Button 
                  onClick={() => setModalTicketVisible(false)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#d9d9d9',
                    color: '#000000',
                    fontWeight: '500'
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={ticketLoading}
                  style={{
                    backgroundColor: '#722ed1',
                    borderColor: '#722ed1',
                    color: 'white',
                    fontWeight: '500'
                  }}
                >
                  Actualizar Entrada
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
} 