-- Actualizar productos existentes para asegurar categorías correctas
UPDATE productos SET categoria = 'Bebidas' WHERE nombre LIKE '%Cerveza%' OR nombre LIKE '%Vino%' OR nombre LIKE '%Whisky%' OR nombre LIKE '%Ron%' OR nombre LIKE '%Vodka%' OR nombre LIKE '%Ginebra%' OR nombre LIKE '%Tequila%';

UPDATE productos SET categoria = 'Comida' WHERE nombre LIKE '%Papas%' OR nombre LIKE '%Nachos%' OR nombre LIKE '%Hamburguesa%' OR nombre LIKE '%Pizza%' OR nombre LIKE '%Ensalada%';

-- Agregar más bebidas
INSERT INTO productos (nombre, precio, stock, descripcion, categoria) VALUES
('Cerveza Budweiser', 3.80, 75, 'Cerveza americana 330ml', 'Bebidas'),
('Cerveza Quilmes', 3.20, 90, 'Cerveza argentina 330ml', 'Bebidas'),
('Cerveza Brahma', 3.00, 85, 'Cerveza brasileña 330ml', 'Bebidas'),
('Cerveza Patagonia', 4.20, 60, 'Cerveza artesanal argentina 330ml', 'Bebidas'),
('Vino Tinto Cabernet', 9.50, 25, 'Vino tinto chileno 750ml', 'Bebidas'),
('Vino Blanco Sauvignon Blanc', 8.80, 20, 'Vino blanco chileno 750ml', 'Bebidas'),
('Champagne Moët', 25.00, 10, 'Champagne francés 750ml', 'Bebidas'),
('Gin Tonic', 6.50, 30, 'Gin tonic preparado', 'Bebidas'),
('Mojito', 7.00, 25, 'Mojito con ron y menta', 'Bebidas'),
('Caipirinha', 6.80, 20, 'Caipirinha brasileña', 'Bebidas'),
('Margarita', 7.50, 18, 'Margarita con tequila', 'Bebidas'),
('Daiquiri', 7.20, 15, 'Daiquiri de frutilla', 'Bebidas'),
('Fernet con Cola', 4.50, 40, 'Fernet con Coca Cola', 'Bebidas'),
('Cuba Libre', 5.00, 35, 'Ron con Coca Cola y limón', 'Bebidas'),
('Piña Colada', 6.80, 20, 'Piña colada con ron', 'Bebidas'),
('Agua Mineral', 2.00, 100, 'Agua mineral 500ml', 'Bebidas'),
('Gaseosa Coca Cola', 2.50, 80, 'Coca Cola 500ml', 'Bebidas'),
('Gaseosa Sprite', 2.30, 70, 'Sprite 500ml', 'Bebidas'),
('Gaseosa Fanta', 2.30, 65, 'Fanta naranja 500ml', 'Bebidas'),
('Limonada', 3.50, 30, 'Limonada natural', 'Bebidas'),
('Jugo de Naranja', 4.00, 25, 'Jugo de naranja natural', 'Bebidas'),
('Café Americano', 3.00, 50, 'Café americano', 'Bebidas'),
('Café Espresso', 2.50, 45, 'Café espresso', 'Bebidas'),
('Café Cappuccino', 4.00, 40, 'Café cappuccino', 'Bebidas'),
('Té Verde', 3.50, 35, 'Té verde natural', 'Bebidas'),
('Té Negro', 3.00, 30, 'Té negro', 'Bebidas');

-- Agregar más comidas
INSERT INTO productos (nombre, precio, stock, descripcion, categoria) VALUES
('Empanadas de Carne', 8.00, 40, 'Empanadas de carne vacuna (3 unidades)', 'Comida'),
('Empanadas de Pollo', 7.50, 35, 'Empanadas de pollo (3 unidades)', 'Comida'),
('Empanadas de Jamón y Queso', 7.00, 30, 'Empanadas de jamón y queso (3 unidades)', 'Comida'),
('Milanesa de Ternera', 15.00, 25, 'Milanesa de ternera con papas fritas', 'Comida'),
('Milanesa de Pollo', 13.00, 30, 'Milanesa de pollo con papas fritas', 'Comida'),
('Milanesa Napolitana', 16.00, 20, 'Milanesa napolitana con papas fritas', 'Comida'),
('Asado de Tira', 18.00, 15, 'Asado de tira con ensalada', 'Comida'),
('Bife de Chorizo', 20.00, 12, 'Bife de chorizo con papas fritas', 'Comida'),
('Pollo a la Plancha', 14.00, 18, 'Pollo a la plancha con vegetales', 'Comida'),
('Pescado Frito', 16.00, 10, 'Pescado frito con papas fritas', 'Comida'),
('Ravioles de Ricotta', 12.00, 25, 'Ravioles de ricotta con salsa', 'Comida'),
('Fetuccini Alfredo', 13.00, 20, 'Fetuccini con salsa alfredo', 'Comida'),
('Lasagna de Carne', 14.00, 15, 'Lasagna de carne con bechamel', 'Comida'),
('Canelones de Espinaca', 13.50, 12, 'Canelones de espinaca y ricotta', 'Comida'),
('Risotto de Hongos', 11.00, 18, 'Risotto de hongos parmesano', 'Comida'),
('Paella de Mariscos', 22.00, 8, 'Paella de mariscos para 2 personas', 'Comida'),
('Sándwich de Milanesa', 10.00, 30, 'Sándwich de milanesa con lechuga y tomate', 'Comida'),
('Sándwich de Jamón y Queso', 8.00, 35, 'Sándwich de jamón y queso', 'Comida'),
('Sándwich de Pollo', 9.00, 25, 'Sándwich de pollo con vegetales', 'Comida'),
('Tacos de Carne', 12.00, 20, 'Tacos de carne con guacamole (3 unidades)', 'Comida'),
('Burritos de Pollo', 13.00, 18, 'Burritos de pollo con frijoles', 'Comida'),
('Quesadillas', 11.00, 22, 'Quesadillas de queso y pollo', 'Comida'),
('Guacamole con Nachos', 8.50, 25, 'Guacamole fresco con nachos', 'Comida'),
('Salsa de Queso', 6.00, 30, 'Salsa de queso fundido', 'Comida'),
('Ensalada César', 10.00, 15, 'Ensalada César con pollo', 'Comida'),
('Ensalada Griega', 9.00, 12, 'Ensalada griega con feta', 'Comida'),
('Ensalada de Frutas', 7.00, 20, 'Ensalada de frutas frescas', 'Comida'),
('Sopa del Día', 8.00, 25, 'Sopa casera del día', 'Comida'),
('Crema de Zapallo', 7.50, 18, 'Crema de zapallo casera', 'Comida'),
('Flan Casero', 6.00, 20, 'Flan casero con dulce de leche', 'Comida'),
('Tiramisú', 8.00, 15, 'Tiramisú italiano', 'Comida'),
('Cheesecake', 7.50, 12, 'Cheesecake de frutos rojos', 'Comida'),
('Helado de Vainilla', 5.00, 30, 'Helado de vainilla (2 bochas)', 'Comida'),
('Helado de Chocolate', 5.50, 25, 'Helado de chocolate (2 bochas)', 'Comida'),
('Helado de Frutilla', 5.00, 20, 'Helado de frutilla (2 bochas)', 'Comida'),
('Brownie', 6.50, 18, 'Brownie con nueces', 'Comida'),
('Alfajores', 4.00, 40, 'Alfajores de maicena (2 unidades)', 'Comida'),
('Facturas', 3.50, 35, 'Facturas variadas (3 unidades)', 'Comida'),
('Tostadas con Manteca', 4.00, 25, 'Tostadas con manteca y mermelada', 'Comida'),
('Tostadas con Palta', 5.00, 20, 'Tostadas con palta y huevo', 'Comida'),
('Huevos Revueltos', 8.00, 15, 'Huevos revueltos con tostadas', 'Comida'),
('Omelette de Queso', 9.00, 12, 'Omelette de queso con vegetales', 'Comida'),
('Pancakes', 7.00, 18, 'Pancakes con miel y frutas', 'Comida'),
('Waffles', 8.00, 15, 'Waffles con crema y frutas', 'Comida'),
('Yogur con Granola', 6.00, 20, 'Yogur natural con granola', 'Comida'),
('Avena con Frutas', 5.50, 15, 'Avena con frutas y miel', 'Comida'),
('Smoothie de Frutas', 7.00, 20, 'Smoothie de frutas mixtas', 'Comida'),
('Smoothie Verde', 7.50, 15, 'Smoothie verde con espinaca', 'Comida'),
('Bowl de Açaí', 9.00, 10, 'Bowl de açaí con granola', 'Comida'),
('Tarta de Manzana', 6.50, 12, 'Tarta de manzana casera', 'Comida'),
('Tarta de Limón', 6.00, 10, 'Tarta de limón casera', 'Comida'),
('Churros', 5.00, 25, 'Churros con chocolate (4 unidades)', 'Comida'),
('Chocolate Caliente', 4.50, 30, 'Chocolate caliente con crema', 'Comida'),
('Café con Leche', 3.50, 40, 'Café con leche', 'Comida'),
('Té con Leche', 3.00, 25, 'Té con leche', 'Comida'),
('Leche con Chocolate', 4.00, 20, 'Leche con chocolate', 'Comida'),
('Licuado de Banana', 5.50, 15, 'Licuado de banana con leche', 'Comida'),
('Licuado de Frutilla', 5.50, 15, 'Licuado de frutilla con leche', 'Comida'),
('Licuado de Durazno', 5.50, 15, 'Licuado de durazno con leche', 'Comida');

-- Verificar que todos los productos tengan categoría asignada
UPDATE productos SET categoria = 'Bebidas' WHERE categoria IS NULL AND (nombre LIKE '%Cerveza%' OR nombre LIKE '%Vino%' OR nombre LIKE '%Whisky%' OR nombre LIKE '%Ron%' OR nombre LIKE '%Vodka%' OR nombre LIKE '%Ginebra%' OR nombre LIKE '%Tequila%' OR nombre LIKE '%Café%' OR nombre LIKE '%Té%' OR nombre LIKE '%Agua%' OR nombre LIKE '%Gaseosa%' OR nombre LIKE '%Jugo%' OR nombre LIKE '%Limonada%' OR nombre LIKE '%Champagne%' OR nombre LIKE '%Gin%' OR nombre LIKE '%Mojito%' OR nombre LIKE '%Caipirinha%' OR nombre LIKE '%Margarita%' OR nombre LIKE '%Daiquiri%' OR nombre LIKE '%Fernet%' OR nombre LIKE '%Cuba%' OR nombre LIKE '%Piña%');

UPDATE productos SET categoria = 'Comida' WHERE categoria IS NULL;

-- Mostrar resumen de productos por categoría
SELECT categoria, COUNT(*) as cantidad FROM productos GROUP BY categoria ORDER BY categoria; 