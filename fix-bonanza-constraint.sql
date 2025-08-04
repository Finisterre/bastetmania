-- Script para actualizar la restricción de modo_pago para permitir 'bonanza'
-- Ejecutar en Supabase SQL Editor

-- Primero, eliminar la restricción existente
ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_modo_pago_check;

-- Crear la nueva restricción que incluye 'bonanza'
ALTER TABLE ventas ADD CONSTRAINT ventas_modo_pago_check 
CHECK (modo_pago IN ('efectivo', 'digital', 'bonanza'));

-- Verificar que la restricción se aplicó correctamente
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'ventas'::regclass 
AND contype = 'c' 
AND conname = 'ventas_modo_pago_check'; 