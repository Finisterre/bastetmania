# Administrador de Compras - Bar

Sistema de administración de compras para un bar, desarrollado con Next.js, Supabase y Ant Design.

## Características

- 📦 Listado de productos con stock en tiempo real
- 💰 Sistema de ventas con modal de confirmación
- 💳 Soporte para pagos en efectivo y digital
- 📊 Estadísticas de ventas por método de pago
- 🔄 Actualización automática de stock
- 🎨 Interfaz moderna con Ant Design

## Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Ant Design
- **Base de Datos**: Supabase (PostgreSQL)
- **Estilos**: Tailwind CSS

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > API para obtener tus credenciales
3. Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 3. Configurar la Base de Datos

1. Ve al SQL Editor en tu proyecto de Supabase
2. Ejecuta el contenido del archivo `database-setup.sql`
3. Esto creará:
   - Tabla `productos` con productos de ejemplo
   - Tabla `ventas` para registrar transacciones
   - Índices para optimizar consultas
   - Vista para estadísticas
   - Políticas de seguridad (RLS)

### 4. Ejecutar el proyecto

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## Estructura de la Base de Datos

### Tabla `productos`
- `id`: Identificador único
- `nombre`: Nombre del producto
- `precio`: Precio unitario
- `stock`: Cantidad disponible
- `descripcion`: Descripción opcional
- `categoria`: Categoría del producto
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

### Tabla `ventas`
- `id`: Identificador único
- `producto_id`: Referencia al producto vendido
- `cantidad`: Cantidad vendida
- `precio_unitario`: Precio por unidad al momento de la venta
- `total`: Total de la venta
- `modo_pago`: 'efectivo' o 'digital'
- `fecha_venta`: Fecha y hora de la venta
- `created_at`: Fecha de creación del registro

## Funcionalidades

### Listado de Productos
- Muestra todos los productos con su información
- Indica stock disponible
- Botón de "Vender" para cada producto

### Modal de Venta
- Detalles del producto seleccionado
- Input para cantidad (con validación de stock)
- Selector de modo de pago (efectivo/digital)
- Confirmación de venta

### Estadísticas
- Total de ventas en efectivo
- Total de ventas digitales
- Total general de ventas

### Gestión de Stock
- Actualización automática al realizar ventas
- Validación de stock disponible
- Productos sin stock se deshabilitan

## Scripts Disponibles

- `npm run dev`: Ejecutar en modo desarrollo
- `npm run build`: Construir para producción
- `npm run start`: Ejecutar en modo producción
- `npm run lint`: Ejecutar linter

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
