-- ============================================
-- RENTAZT - OPERATIONS PIVOT SCHEMA
-- Febrero 2026: Negocio de Rigging & Crew
-- ============================================

-- 1. KITS MODULARES
CREATE TABLE IF NOT EXISTS kit_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users, -- owner/admin que lo creó
  name TEXT NOT NULL,
  description TEXT,
  suggested_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kit_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kit_template_id UUID REFERENCES kit_templates(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  is_charged BOOLEAN DEFAULT true, -- false para items incluidos/gratis (e.g. cables)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MULTI-LOCATION TRACKING & PEQUEÑOS COMPONENTES
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS current_location TEXT DEFAULT 'bucareli', -- 'econoline', 'crafter', 'bucareli', 'saavedra', 'en_renta'
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_bundle_component BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bundle_parent_category TEXT,
ADD COLUMN IF NOT EXISTS requires_detailed_count BOOLEAN DEFAULT false; -- true para tornillos, cubos, etc.

CREATE TABLE IF NOT EXISTS location_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  from_location TEXT,
  to_location TEXT,
  moved_at TIMESTAMPTZ DEFAULT NOW(),
  moved_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- 3. CREW MANAGEMENT (MANO DE OBRA)
CREATE TABLE IF NOT EXISTS crew_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users, -- owner/admin
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('rigger', 'ground', 'both')),
  daily_rate NUMERIC NOT NULL, -- Ej: 1200 para rigger, 750 para ground
  phone TEXT,
  email TEXT,
  certifications JSONB,
  availability_status TEXT DEFAULT 'available', -- 'available', 'busy', 'off'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rental_crew (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
  role_in_event TEXT CHECK (role_in_event IN ('rigger', 'ground')),
  days INT NOT NULL,
  daily_rate_snapshot NUMERIC NOT NULL,
  subtotal NUMERIC, -- days * daily_rate_snapshot
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rentals
ADD COLUMN IF NOT EXISTS labor_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_kit BOOLEAN DEFAULT false;

-- 4. CHECKLIST FOTOGRÁFICO DE ENTREGA/DEVOLUCIÓN (NUEVO)
CREATE TABLE IF NOT EXISTS delivery_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('delivery', 'return')),
  photo_urls TEXT[], -- URLs a cloud storage
  signature_url TEXT, -- Firma digital
  notes TEXT,
  checked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID REFERENCES delivery_checklists(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  expected_quantity INT,
  actual_quantity INT,
  status TEXT CHECK (status IN ('ok', 'damaged', 'missing')),
  photo_url TEXT, -- Foto si está dañado
  notes TEXT
);

-- RLS & Policies
ALTER TABLE kit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- (Policies simplificadas para demo: el usuario autenticado puede ver/editar su propio scope)
CREATE POLICY "Users access kits" ON kit_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access crew" ON crew_members FOR ALL USING (auth.uid() = user_id);
-- Resto de dependencias se manejan vía JOIN en la UI o RLS recursivo. No se incluyen por brevedad en la demo inicial.
