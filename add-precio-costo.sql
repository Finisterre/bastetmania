-- Agregar campo precio_costo a la tabla productos
ALTER TABLE productos ADD COLUMN precio_costo DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Actualizar productos existentes con un precio_costo por defecto (puedes ajustar según necesites)
-- Por ejemplo, establecer el precio_costo como el 70% del precio de venta
UPDATE productos SET precio_costo = ROUND(precio * 0.7, 2) WHERE precio_costo = 0.00;

-- Agregar comentario al campo para documentación
COMMENT ON COLUMN productos.precio_costo IS 'Precio de costo del producto para cálculo de ganancias'; 