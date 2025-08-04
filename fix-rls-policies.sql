-- Script para arreglar las políticas de Row Level Security
-- Ejecuta este script en el SQL Editor de Supabase

-- Primero, eliminar las políticas existentes
DROP POLICY IF EXISTS "Productos visibles para todos" ON productos;
DROP POLICY IF EXISTS "Productos editables por autenticados" ON productos;
DROP POLICY IF EXISTS "Ventas visibles por autenticados" ON ventas;
DROP POLICY IF EXISTS "Ventas editables por autenticados" ON ventas;

-- Crear nuevas políticas que permitan acceso anónimo
-- Políticas para productos (lectura y escritura pública)
CREATE POLICY "Productos acceso público" ON productos
    FOR ALL USING (true);

-- Políticas para ventas (lectura y escritura pública)
CREATE POLICY "Ventas acceso público" ON ventas
    FOR ALL USING (true);

-- Alternativamente, si prefieres mantener RLS pero con acceso anónimo:
-- CREATE POLICY "Productos acceso anónimo" ON productos
--     FOR ALL USING (true);
-- 
-- CREATE POLICY "Ventas acceso anónimo" ON ventas
--     FOR ALL USING (true);

-- Verificar que las políticas están activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('productos', 'ventas'); 