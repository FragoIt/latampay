-- Create leads table for capturing calculator submissions
create table leads (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  company_name text,
  monthly_volume numeric,
  current_fee_percent numeric,
  calculated_savings numeric,
  source text default 'calculator',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster email lookups
create index leads_email_idx on leads(email);

-- Enable RLS
alter table leads enable row level security;

-- Allow anonymous inserts (for landing page)
create policy "Anyone can insert leads"
  on leads for insert
  with check (true);

-- Only service role can read leads (for admin dashboard later)
create policy "Service role can read leads"
  on leads for select
  using (auth.role() = 'service_role');
