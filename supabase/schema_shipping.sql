-- ============================================
-- RENTAZT - Shipping Configuration Schema
-- ============================================

-- Costos de envío configurables por usuario
CREATE TABLE IF NOT EXISTS shipping_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  distance_a_cost NUMERIC DEFAULT 50,    -- 0-20 km
  distance_b_cost NUMERIC DEFAULT 100,   -- 20-50 km
  distance_c_cost NUMERIC DEFAULT 200,   -- 50+ km
  loading_hourly_rate NUMERIC DEFAULT 30, -- $/hora carga/descarga
  insurance_pct NUMERIC DEFAULT 0.02,     -- 2% del valor de equipos
  fuel_per_km NUMERIC DEFAULT 0.50,       -- $/km
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar campos de envío a rentas existentes
ALTER TABLE rentals
  ADD COLUMN IF NOT EXISTS requires_shipping BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS shipping_distance_km NUMERIC,
  ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0;

-- RLS para shipping_config
ALTER TABLE shipping_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shipping config"
  ON shipping_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shipping config"
  ON shipping_config FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shipping config"
  ON shipping_config FOR UPDATE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_shipping_config_user ON shipping_config(user_id);
