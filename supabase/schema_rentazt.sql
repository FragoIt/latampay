-- ============================================
-- RENTAZT - Database Schema
-- Sistema de gestión de inventario y rentas
-- ============================================

-- Clientes (empresas o personas que rentan equipos)
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  credit_score INT DEFAULT 100 CHECK (credit_score >= 0 AND credit_score <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catálogo de equipos
CREATE TABLE inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT CHECK (category IN ('truss', 'motor', 'audio', 'iluminacion', 'video', 'rigging', 'otro')),
  daily_rate NUMERIC NOT NULL,
  quantity_total INT NOT NULL DEFAULT 1,
  quantity_available INT NOT NULL DEFAULT 1,
  location TEXT DEFAULT 'Bodega',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rentas (contratos)
CREATE TABLE rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clients NOT NULL,
  event_name TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  actual_return_date DATE,
  status TEXT CHECK (status IN ('active', 'returned', 'overdue', 'cancelled')) DEFAULT 'active',
  total_amount NUMERIC,
  penalty_amount NUMERIC DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items por renta
CREATE TABLE rental_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID REFERENCES rentals ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items,
  quantity INT NOT NULL DEFAULT 1,
  daily_rate_at_time NUMERIC NOT NULL,
  condition_out TEXT,
  condition_in TEXT,
  returned BOOLEAN DEFAULT FALSE
);

-- Log de movimientos (trazabilidad)
CREATE TABLE movement_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  rental_id UUID REFERENCES rentals,
  item_id UUID REFERENCES inventory_items,
  action TEXT CHECK (action IN ('checkout', 'return', 'damage', 'maintenance')),
  quantity INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (Multi-tenant)
-- ============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_log ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE USING (auth.uid() = user_id);

-- Inventory policies
CREATE POLICY "Users can view their own inventory"
  ON inventory_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own inventory"
  ON inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inventory"
  ON inventory_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inventory"
  ON inventory_items FOR DELETE USING (auth.uid() = user_id);

-- Rentals policies
CREATE POLICY "Users can view their own rentals"
  ON rentals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own rentals"
  ON rentals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rentals"
  ON rentals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rentals"
  ON rentals FOR DELETE USING (auth.uid() = user_id);

-- Rental items policies (through rental ownership)
CREATE POLICY "Users can view rental items through rentals"
  ON rental_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM rentals WHERE rentals.id = rental_items.rental_id AND rentals.user_id = auth.uid()));
CREATE POLICY "Users can insert rental items through rentals"
  ON rental_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM rentals WHERE rentals.id = rental_items.rental_id AND rentals.user_id = auth.uid()));
CREATE POLICY "Users can update rental items through rentals"
  ON rental_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM rentals WHERE rentals.id = rental_items.rental_id AND rentals.user_id = auth.uid()));
CREATE POLICY "Users can delete rental items through rentals"
  ON rental_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM rentals WHERE rentals.id = rental_items.rental_id AND rentals.user_id = auth.uid()));

-- Movement log policies
CREATE POLICY "Users can view their own movement logs"
  ON movement_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own movement logs"
  ON movement_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Useful indexes
-- ============================================

CREATE INDEX idx_inventory_user ON inventory_items(user_id);
CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_rentals_user ON rentals(user_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_client ON rentals(client_id);
CREATE INDEX idx_rental_items_rental ON rental_items(rental_id);
CREATE INDEX idx_movement_log_rental ON movement_log(rental_id);
CREATE INDEX idx_clients_user ON clients(user_id);
