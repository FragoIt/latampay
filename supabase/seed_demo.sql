-- ============================================
-- RENTAZT - SEMILLA DE DATOS PARA DEMO
-- Ejecuta este script en el SQL Editor de Supabase
-- para cargar datos realistas para la presentación.
-- ============================================

-- 1. Limpiar datos existentes (Opcional, comenta si quieres mantener)
TRUNCATE TABLE movement_log, rental_items, rentals, inventory_items, clients CASCADE;

-- 2. Variables para IDs (Supabase no soporta vars simples en SQL editor a veces, usamos subqueries o hardcoded UUIDs si fuera necesario, pero INSERT ... RETURNING es mejor en apps. Aquí usaremos inserts directos con gen_random_uuid() implícito)

-- 3. Clientes VIP
INSERT INTO clients (name, phone, email, credit_score, notes) VALUES
('Eventos Corporativos Global', '+525512345678', 'contacto@globalcorp.mx', 100, 'Cliente Premium, paga por adelantado'),
('Boda Familia Pérez', '+525598765432', 'perez@gmail.com', 95, 'Boda en Hacienda San Gabriel'),
('Festival de Jazz 2026', '+525545678901', 'produccion@jazzfest.mx', 80, 'Suele pedir descuentos'),
('Organización X (Moroso)', '+525511223344', 'deudas@orgx.com', 40, 'Siempre entrega tarde y roto');

-- 4. Inventario de Alto Impacto
INSERT INTO inventory_items (name, category, daily_rate, quantity_total, quantity_available, location) VALUES
('Sistema Line Array JBL VTX A8', 'audio', 1500.00, 12, 12, 'Bodega A'),
('Subwoofer JBL G28', 'audio', 800.00, 8, 8, 'Bodega A'),
('Cabeza Móvil Beam 230W', 'iluminacion', 350.00, 24, 24, 'Estante 4'),
('Consola Yamaha CL5', 'audio', 2500.00, 2, 2, 'Cuarto Caliente'),
('Pantalla LED P3.9 (m2)', 'video', 1200.00, 50, 50, 'Bodega B'),
('Micrófono Shure Axient Digital', 'audio', 400.00, 8, 8, 'Cajón Micros'),
('Estructura Truss 3m', 'truss', 150.00, 40, 40, 'Patio');

-- 5. Crear Rentas Históricas (Para que el Dashboard se vea bonito)
-- Nota: En un script SQL puro es difícil vincular IDs dinámicos sin PL/pgSQL.
-- Para simplificar, insertamos usando subqueries.

-- Renta 1: Completada mes pasado (Eventos Corp)
WITH client AS (SELECT id, user_id FROM clients WHERE name = 'Eventos Corporativos Global'),
     rental AS (
       INSERT INTO rentals (user_id, client_id, event_name, start_date, end_date, actual_return_date, status, total_amount, payment_status, created_at)
       SELECT user_id, id, 'Convención Anual', NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days', 'returned', 15000, 'paid', NOW() - INTERVAL '30 days'
       FROM client
       RETURNING id
     )
INSERT INTO rental_items (rental_id, item_id, quantity, daily_rate_at_time)
SELECT rental.id, inventory_items.id, 2, inventory_items.daily_rate
FROM rental, inventory_items WHERE inventory_items.name LIKE 'Consola%';

-- Renta 2: Activa (Para DEMO de Devolución) - Boda Pérez
-- Esta es la que usaremos para mostrar la devolución y multa si queremos, o devolución limpia.
-- La pondremos que debió volver ayer (Vencida) para mostrar la multa.
WITH client AS (SELECT id, user_id FROM clients WHERE name = 'Boda Familia Pérez'),
     rental AS (
       INSERT INTO rentals (user_id, client_id, event_name, start_date, end_date, status, total_amount, payment_status)
       SELECT user_id, id, 'Boda Civil y Fiesta', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', 'active', 5000, 'pending'
       FROM client
       RETURNING id
     )
INSERT INTO rental_items (rental_id, item_id, quantity, daily_rate_at_time)
SELECT rental.id, inventory_items.id, 4, inventory_items.daily_rate
FROM rental, inventory_items WHERE inventory_items.name LIKE 'Sistema Line Array%';

-- Renta 3: Activa (Para DEMO de Contrato) - Festival Jazz
-- Futura.
WITH client AS (SELECT id, user_id FROM clients WHERE name = 'Festival de Jazz 2026'),
     rental AS (
       INSERT INTO rentals (user_id, client_id, event_name, start_date, end_date, status, total_amount, payment_status)
       SELECT user_id, id, 'Escenario Principal', NOW() + INTERVAL '5 days', NOW() + INTERVAL '7 days', 'active', 25000, 'partial'
       FROM client
       RETURNING id
     )
INSERT INTO rental_items (rental_id, item_id, quantity, daily_rate_at_time)
SELECT rental.id, inventory_items.id, 10, inventory_items.daily_rate
FROM rental, inventory_items WHERE inventory_items.name LIKE 'Pantalla LED%';

-- Actualizar disponibilidad (Restar lo que está rentado "active")
-- Esto es un hack rápido, en producción se hace vía aplicación/trigger
UPDATE inventory_items 
SET quantity_available = quantity_total - (
  SELECT COALESCE(SUM(quantity), 0) 
  FROM rental_items 
  JOIN rentals ON rentals.id = rental_items.rental_id 
  WHERE rentals.status = 'active' AND rental_items.item_id = inventory_items.id
);
