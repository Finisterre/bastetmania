-- Script para configurar el sistema de tickets/entradas
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Crear tabla de tickets
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar registro inicial de ticket
INSERT INTO tickets (precio, descripcion) 
VALUES (25.00, 'Entrada general para el show/evento')
ON CONFLICT DO NOTHING;

-- 3. Agregar columna para identificar ventas de tickets en la tabla ventas
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS es_ticket BOOLEAN DEFAULT false;

-- 4. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_ventas_es_ticket ON ventas(es_ticket);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_ticket ON ventas(fecha_venta) WHERE es_ticket = true;

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Crear trigger para tickets
CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Configurar RLS para tickets (acceso público)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Política para tickets (lectura y escritura pública)
CREATE POLICY "Tickets acceso público" ON tickets
    FOR ALL USING (true);

-- 8. Verificar la configuración
SELECT 'Tabla tickets creada correctamente' as status;

-- Mostrar el registro de ticket
SELECT * FROM tickets;

-- Mostrar estructura de ventas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ventas' 
ORDER BY ordinal_position; 