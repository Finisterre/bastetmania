-- Script para permitir ventas de tickets sin producto_id
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Modificar la columna producto_id para permitir NULL
ALTER TABLE ventas 
ALTER COLUMN producto_id DROP NOT NULL;

-- 2. Verificar que la columna es_ticket existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'es_ticket'
    ) THEN
        ALTER TABLE ventas ADD COLUMN es_ticket BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. Crear un índice para mejorar el rendimiento de consultas de tickets
CREATE INDEX IF NOT EXISTS idx_ventas_tickets ON ventas(es_ticket, fecha_venta) WHERE es_ticket = true;

-- 4. Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ventas' 
AND column_name IN ('producto_id', 'es_ticket')
ORDER BY ordinal_position;

-- 5. Mostrar un mensaje de confirmación
SELECT 'Tabla ventas actualizada correctamente para soportar tickets' as status; 