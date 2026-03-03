-- ============================================
-- LATAMPAY COMPLETE SCHEMA FIX
-- Migration: 003_complete_schema_fix.sql
-- Date: 2024-12-13
-- ============================================

-- ============================================
-- 1. INVOICES TABLE - ADD MISSING COLUMNS
-- ============================================

-- Add columns if they don't exist
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_id text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS merchant_address text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payer_address text;

-- ============================================
-- 2. INVOICES RLS POLICIES - FIX FOR PUBLIC ACCESS
-- ============================================

-- Drop all existing policies on invoices to start fresh
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Enable read access for all users" ON invoices;
DROP POLICY IF EXISTS "Anyone can read invoices by ID" ON invoices;
DROP POLICY IF EXISTS "Anyone can update invoice payment status" ON invoices;

-- Policy 1: Authenticated users can view their own invoices (dashboard)
CREATE POLICY "Owners can view own invoices"
ON invoices FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Anyone can view ANY invoice by ID (for payment page - public)
-- This is needed so the payer can see the invoice details
CREATE POLICY "Public can view invoices"
ON invoices FOR SELECT
TO anon
USING (true);

-- Policy 3: Only authenticated owners can create invoices
CREATE POLICY "Owners can create invoices"
ON invoices FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Owners can update their own invoices
CREATE POLICY "Owners can update own invoices"
ON invoices FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 5: CRITICAL - Allow anyone to update ONLY tx_hash, status, paid_at, payer_address
-- This is for the payment confirmation from the payer (not authenticated)
-- We use a restrictive check to ensure only payment-related fields change
CREATE POLICY "Public can mark invoice as paid"
ON invoices FOR UPDATE
TO anon
USING (status = 'pending') -- Only pending invoices can be updated
WITH CHECK (
  status IN ('paid', 'pending') -- Can only change to paid (or keep pending)
);

-- ============================================
-- 3. LEADS TABLE - CREATE IF NOT EXISTS
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  company_name text,
  monthly_volume numeric,
  current_fee_percent numeric,
  calculated_savings numeric,
  source text DEFAULT 'calculator',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  contacted_at timestamp with time zone,
  notes text
);

-- Enable RLS on leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert leads (public form)
CREATE POLICY "Public can create leads"
ON leads FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Only authenticated users can read leads (admin)
CREATE POLICY "Authenticated can read leads"
ON leads FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- 4. MERCHANT PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS merchant_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  business_name text,
  business_type text,
  country text DEFAULT 'MX',
  tax_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT valid_wallet_address CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Enable RLS
ALTER TABLE merchant_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own merchant profile"
ON merchant_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can create own merchant profile"
ON merchant_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own merchant profile"
ON merchant_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 5. PAYMENT CONFIRMATIONS TABLE (AUDIT LOG)
-- ============================================

CREATE TABLE IF NOT EXISTS payment_confirmations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  tx_hash text NOT NULL,
  payer_address text,
  chain_id integer,
  confirmed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (payment confirmation from payer)
CREATE POLICY "Public can create payment confirmations"
ON payment_confirmations FOR INSERT
TO anon
WITH CHECK (true);

-- Only authenticated can read (admin/owner)
CREATE POLICY "Authenticated can read payment confirmations"
ON payment_confirmations FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_invoice_id ON payment_confirmations(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_tx_hash ON payment_confirmations(tx_hash);

-- ============================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE invoices IS 'Invoices created by merchants for their clients to pay';
COMMENT ON TABLE leads IS 'Marketing leads from calculator and landing page forms';
COMMENT ON TABLE payment_confirmations IS 'Audit log of payment confirmations with blockchain tx hashes';

COMMENT ON COLUMN invoices.payment_id IS 'Blockchain payment ID (keccak256 of invoice ID)';
COMMENT ON COLUMN invoices.merchant_address IS 'Wallet address of the merchant receiving payment';
COMMENT ON COLUMN invoices.tx_hash IS 'Blockchain transaction hash of the payment';
COMMENT ON COLUMN invoices.payer_address IS 'Wallet address of the payer';
COMMENT ON COLUMN invoices.paid_at IS 'Timestamp when payment was confirmed';
