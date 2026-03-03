#!/bin/bash

# Script para ejecutar la migración en Supabase
# Requiere Supabase CLI instalado: npm install -g supabase

echo "🔄 Aplicando migración para habilitar lectura pública de invoices..."

# Opción 1: Si tienes Supabase CLI
# supabase db push

# Opción 2: Manual - copia y pega este SQL en el SQL Editor de Supabase:
echo "
-- Enable public read access to invoices for payment page
DROP POLICY IF EXISTS \"Enable read access for all users\" ON invoices;

CREATE POLICY \"Enable read access for all users\"
ON invoices FOR SELECT
USING (true);
"

echo "✅ Copia el SQL de arriba y ejecútalo en Supabase Dashboard > SQL Editor"
echo "   O ejecuta: supabase db push"
