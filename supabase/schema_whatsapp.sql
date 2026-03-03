-- ============================================
-- RENTAZT - WhatsApp Integration Schema
-- ============================================

-- Log de mensajes de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users, -- Nullable para mensajes entrantes antes de identificar usuario
  phone_number TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')) NOT NULL,
  message_type TEXT NOT NULL, -- text, interactive, template
  content JSONB NOT NULL,
  status TEXT DEFAULT 'sent', -- sent, delivered, read, failed
  external_id TEXT, -- ID de mensaje de Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index por teléfono y fecha
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_phone ON whatsapp_log(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_created ON whatsapp_log(created_at DESC);

-- RLS
ALTER TABLE whatsapp_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own whatsapp logs"
  ON whatsapp_log FOR SELECT USING (auth.uid() = user_id);
-- Permitir insert desde edge function (role service_role sáltase RLS, pero definimos policy por si acaso)
