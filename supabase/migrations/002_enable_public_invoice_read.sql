-- Enable public read access to invoices for payment page
-- This allows anyone with the invoice ID to view it (needed for payment)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON invoices;

-- Allow public read access to invoices
CREATE POLICY "Enable read access for all users"
ON invoices FOR SELECT
USING (true);

-- Keep existing auth policies for write operations
-- (Users can only create/update their own invoices)
