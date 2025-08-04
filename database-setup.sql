-- Crear tabla de productos
CREATE TABLE productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    descripcion TEXT,
    categoria VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de ventas
CREATE TABLE ventas (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    modo_pago VARCHAR(20) NOT NULL CHECK (modo_pago IN ('efectivo', 'digital')),
    fecha_venta TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_ventas_producto_id ON ventas(producto_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_ventas_modo_pago ON ventas(modo_pago);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_productos_updated_at 
    BEFORE UPDATE ON productos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos productos de ejemplo
INSERT INTO productos (nombre, precio, stock, descripcion, categoria) VALUES
('Cerveza Corona', 3.50, 100, 'Cerveza mexicana 330ml', 'Bebidas'),
('Cerveza Heineken', 4.00, 80, 'Cerveza holandesa 330ml', 'Bebidas'),
('Cerveza Stella Artois', 4.50, 60, 'Cerveza belga 330ml', 'Bebidas'),
('Vino Tinto Malbec', 8.00, 30, 'Vino tinto argentino 750ml', 'Vinos'),
('Vino Blanco Chardonnay', 7.50, 25, 'Vino blanco chileno 750ml', 'Vinos'),
('Whisky Jack Daniels', 12.00, 20, 'Whisky americano 750ml', 'Licores'),
('Ron Bacardi', 10.00, 15, 'Ron blanco 750ml', 'Licores'),
('Vodka Absolut', 11.00, 18, 'Vodka sueco 750ml', 'Licores'),
('Ginebra Bombay', 13.00, 12, 'Ginebra inglesa 750ml', 'Licores'),
('Tequila Jose Cuervo', 9.50, 22, 'Tequila mexicano 750ml', 'Licores'),
('Papas Fritas', 5.00, 50, 'Porción de papas fritas', 'Snacks'),
('Nachos con Queso', 7.00, 40, 'Nachos con queso fundido', 'Snacks'),
('Hamburguesa Clásica', 12.00, 25, 'Hamburguesa con carne, lechuga y tomate', 'Comida'),
('Pizza Margherita', 15.00, 20, 'Pizza con tomate, mozzarella y albahaca', 'Comida'),
('Ensalada César', 10.00, 15, 'Ensalada con lechuga, crutones y aderezo', 'Comida');

-- Crear vista para estadísticas de ventas por producto
CREATE VIEW estadisticas_ventas AS
SELECT 
    p.id,
    p.nombre,
    p.precio,
    p.stock,
    COALESCE(SUM(CASE WHEN v.modo_pago = 'efectivo' THEN v.total ELSE 0 END), 0) as pago_efectivo,
    COALESCE(SUM(CASE WHEN v.modo_pago = 'digital' THEN v.total ELSE 0 END), 0) as pago_digital,
    COALESCE(SUM(v.total), 0) as total_ventas,
    COALESCE(SUM(v.cantidad), 0) as unidades_vendidas
FROM productos p
LEFT JOIN ventas v ON p.id = v.producto_id
GROUP BY p.id, p.nombre, p.precio, p.stock;

-- Configurar Row Level Security (RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- Políticas para productos (lectura pública, escritura autenticada)
CREATE POLICY "Productos visibles para todos" ON productos
    FOR SELECT USING (true);

CREATE POLICY "Productos editables por autenticados" ON productos
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para ventas (lectura y escritura autenticada)
CREATE POLICY "Ventas visibles por autenticados" ON ventas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Ventas editables por autenticados" ON ventas
    FOR ALL USING (auth.role() = 'authenticated'); 