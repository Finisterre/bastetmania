'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Modal, Form, Input, Select, message, Row, Col, Statistic, Spin, Alert } from 'antd'
import { ShoppingCartOutlined, DollarOutlined, CreditCardOutlined } from '@ant-design/icons'
import { supabase } from '@/lib/supabase'
import { Ticket, VentaTicket } from '@/types'
import dayjs from 'dayjs'

const { Option } = Select

export default function TicketsPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [ventaLoading, setVentaLoading] = useState(false)
  const [estadisticasHoy, setEstadisticasHoy] = useState({
    totalEfectivo: 0,
    totalDigital: 0,
    totalGeneral: 0,
    cantidadVentas: 0
  })
  const [form] = Form.useForm()

  const cargarTicket = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('activo', true)
        .single()

      if (ticketError) {
        console.error('Error al obtener ticket:', ticketError)
        throw ticketError
      }

      setTicket(ticketData)
      console.log('Ticket cargado:', ticketData)

    } catch (error: unknown) {
      console.error('Error cargando ticket:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el ticket'
      setError(errorMessage)
      setTicket(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const cargarEstadisticasHoy = useCallback(async () => {
    try {
      const hoy = dayjs().startOf('day')
      const manana = dayjs().endOf('day')

      const { data: ventasData, error: ventasError } = await supabase
        .from('ventas')
        .select('*')
        .eq('es_ticket', true)
        .gte('fecha_venta', hoy.toISOString())
        .lte('fecha_venta', manana.toISOString())

      if (ventasError) {
        console.error('Error al obtener estadísticas:', ventasError)
        return
      }

      const ventas = ventasData || []
      const totalEfectivo = ventas.filter(v => v.modo_pago === 'efectivo').reduce((sum, v) => sum + v.total, 0)
      const totalDigital = ventas.filter(v => v.modo_pago === 'digital').reduce((sum, v) => sum + v.total, 0)

      setEstadisticasHoy({
        totalEfectivo,
        totalDigital,
        totalGeneral: totalEfectivo + totalDigital,
        cantidadVentas: ventas.length
      })

    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }, [])

  useEffect(() => {
    cargarTicket()
    cargarEstadisticasHoy()
  }, [cargarTicket, cargarEstadisticasHoy])

  const handleComprarTicket = () => {
    if (!ticket) {
      message.error('No hay ticket disponible')
      return
    }
    form.resetFields()
    setModalVisible(true)
  }

  const handleVentaSubmit = async (values: { cantidad: number; modo_pago: 'efectivo' | 'digital' | 'bonanza' }) => {
    if (!ticket) return

    try {
      setVentaLoading(true)

      const { cantidad, modo_pago } = values
      // Para "bonanza" el total es 0, para otros modos es precio * cantidad
      const total = modo_pago === 'bonanza' ? 0 : cantidad * ticket.precio

      // Crear la venta de ticket
      const { error: ventaError } = await supabase
        .from('ventas')
        .insert({
          cantidad,
          precio_unitario: ticket.precio,
          total,
          modo_pago,
          fecha_venta: new Date().toISOString(),
          es_ticket: true
          // producto_id será NULL por defecto
        })

      if (ventaError) throw ventaError

      const mensaje = modo_pago === 'bonanza' 
        ? `${cantidad} entrada(s) entregada(s) gratis`
        : `Compra de ${cantidad} entrada(s) realizada con éxito`
      
      message.success(mensaje)
      setModalVisible(false)
      cargarEstadisticasHoy() // Recargar estadísticas
    } catch (error) {
      console.error('Error realizando compra:', error)
      message.error('Error al realizar la compra')
    } finally {
      setVentaLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            <span className="mr-3 text-4xl">🎫</span>
            Venta de Entradas
          </h1>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Spin size="large" />
              <p className="mt-4 text-gray-600">Cargando información de entradas...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            <span className="mr-3 text-4xl">🎫</span>
            Venta de Entradas
          </h1>
          <Alert
            message="No hay entradas disponibles"
            description="No se encontró información de entradas configurada."
            type="warning"
            showIcon
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          <span className="mr-3 text-4xl">🎫</span>
          Venta de Entradas
        </h1>

        {/* Mostrar error si existe */}
        {error && (
          <Alert
            message="Error de Conexión"
            description={error}
            type="error"
            showIcon
            className="mb-6"
            action={
              <Button 
                size="small" 
                onClick={cargarTicket}
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

        {/* Estadísticas del día */}
        {/* <Card className="mb-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Estadísticas del Día - {dayjs().format('DD/MM/YYYY')}
            </h2>
          </div>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Entradas Efectivo (Hoy)"
                value={estadisticasHoy.totalEfectivo}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
                formatter={(value) => value?.toLocaleString('es-AR')}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Entradas Digital (Hoy)"
                value={estadisticasHoy.totalDigital}
                prefix={<CreditCardOutlined />}
                valueStyle={{ color: '#1890ff' }}
                formatter={(value) => value?.toLocaleString('es-AR')}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Total General (Hoy)"
                value={estadisticasHoy.totalGeneral}
                valueStyle={{ color: '#722ed1' }}
                formatter={(value) => value?.toLocaleString('es-AR')}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Cantidad de Ventas"
                value={estadisticasHoy.cantidadVentas}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
          </Row>
        </Card> */}

        {/* Información del Ticket */}
        <Card className="mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {ticket.descripcion || 'Entrada para el Show'}
            </h2>
            <p className="text-4xl font-bold text-purple-600 mb-6">
              ${ticket.precio.toLocaleString('es-AR')}
            </p>
            <p className="text-gray-600 mb-6">
              Entrada general para el evento
            </p>
                         <Button
               type="primary"
               size="large"
               icon={<ShoppingCartOutlined />}
               onClick={handleComprarTicket}
               style={{
                 backgroundColor: '#722ed1',
                 borderColor: '#722ed1',
                 color: 'white',
                 fontWeight: '500',
                 height: '50px',
                 fontSize: '18px',
                 padding: '0 40px'
               }}
             >
               Vender Entrada
             </Button>
          </div>
        </Card>

        {/* Modal de Compra */}
                 <Modal
           title="Vender/Entregar Entrada"
           open={modalVisible}
           onCancel={() => setModalVisible(false)}
           footer={null}
           width={500}
         >
          <div className="mb-4 p-4 bg-purple-50 rounded">
            <p><strong>Precio por entrada:</strong> ${ticket.precio.toLocaleString('es-AR')}</p>
            <p><strong>Tipo:</strong> Entrada general</p>
            {ticket.descripcion && (
              <p><strong>Descripción:</strong> {ticket.descripcion}</p>
            )}
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleVentaSubmit}
            initialValues={{ cantidad: 1, modo_pago: 'efectivo' }}
          >
            <Form.Item
              label="Cantidad de Entradas"
              name="cantidad"
              rules={[
                { required: true, message: 'Por favor ingrese la cantidad' },
                { 
                  validator: (_, value) => {
                    const numValue = Number(value)
                    if (isNaN(numValue) || numValue < 1) {
                      return Promise.reject(new Error('La cantidad debe ser mayor a 0'))
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input type="number" min={1} />
            </Form.Item>

                         <Form.Item
               label="Modo de Pago"
               name="modo_pago"
               rules={[{ required: true, message: 'Por favor seleccione el modo de pago' }]}
             >
               <Select>
                 <Option value="efectivo">Efectivo</Option>
                 <Option value="digital">Digital</Option>
                 <Option value="bonanza">Bonanza (Gratis)</Option>
               </Select>
             </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={ventaLoading}
                block
                style={{
                  backgroundColor: '#722ed1',
                  borderColor: '#722ed1',
                  color: 'white',
                  fontWeight: '500',
                  height: '40px',
                  fontSize: '16px'
                }}
              >
                Confirmar Compra
              </Button>
            </Form.Item>
                     </Form>
         </Modal>


       </div>
     </div>
   )
 } 