'use client'

import { useState } from 'react'
import { Menu, Button, Drawer } from 'antd'
import { ShoppingCartOutlined, HistoryOutlined, HomeOutlined, MenuOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  const [drawerVisible, setDrawerVisible] = useState(false)

  const items = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Vender',
      onClick: () => {
        setDrawerVisible(false)
        window.location.href = '/'
      }
    },
    {
      key: '/historial',
      icon: <HistoryOutlined />,
      label: 'Historial de Ventas',
      onClick: () => {
        setDrawerVisible(false)
        window.location.href = '/historial'
      }
    },
    {
      key: '/admin',
      icon: <SettingOutlined />,
      label: 'Administrar Productos',
      onClick: () => {
        setDrawerVisible(false)
        window.location.href = '/admin'
      }
    },
  ]

  return (
    <>
      {/* Botón flotante para abrir el menú */}
      <Button
        type="default"
        icon={<MenuOutlined />}
        onClick={() => setDrawerVisible(true)}
        style={{
          position: 'fixed',
          right: 20,
          top: 20,
          zIndex: 1000,
          borderRadius: '50%',
          width: 50,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease'
        }}
        className="hover:scale-110 floating-button"
      />

      {/* Drawer lateral derecho */}
      <Drawer
        title={
          <div className="flex items-center">
            <ShoppingCartOutlined className="mr-2 text-blue-600" />
            <span>Navegación</span>
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={300}
        closeIcon={<CloseOutlined />}
        styles={{
          header: {
            borderBottom: '1px solid #f0f0f0',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          },
          body: {
            padding: 0,
            background: '#fafafa'
          }
        }}
      >
        <div className="p-6">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCartOutlined className="text-white text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Administrador de Compras
            </h2>
            <p className="text-sm text-gray-600">
              Sistema de gestión para bar
            </p>
          </div>
          
          <Menu
            mode="vertical"
            selectedKeys={[pathname]}
            items={items}
            style={{
              border: 'none',
              background: 'transparent'
            }}
          />
          
          <div className="mt-12 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="flex justify-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-500">
                <p className="font-medium">Versión 1.0</p>
                <p>© 2024 Bar Management</p>
                <p className="mt-1 text-gray-400">Sistema en línea</p>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  )
} 