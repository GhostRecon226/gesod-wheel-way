-- US-side vehicle logistics ERP: loads, drivers, and invoicing.
-- Additive only — no existing tables are touched.

CREATE TABLE public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  payment_method text check (payment_method in ('zelle','ach','other')),
  payment_details text,
  notes text,
  active boolean default true,
  created_at timestamptz default now()
);

CREATE TABLE public.loads (
  id uuid primary key default gen_random_uuid(),
  vin text not null,
  lot_number text,
  buyer_number text,
  customer_id uuid references public.users(id),
  driver_id uuid references public.drivers(id),
  make text,
  model text,
  year integer,
  pickup_location text,
  destination_type text check (destination_type in ('port','yard','container','residence')),
  destination_address text,
  agreed_pickup_price numeric,
  service_fee numeric default 50,
  status text default 'posted' check (status in
    ('posted','driver_assigned','picked_up','in_transit','delivered','invoiced','paid')),
  notes text,
  created_at timestamptz default now()
);

CREATE TABLE public.load_status_history (
  id uuid primary key default gen_random_uuid(),
  load_id uuid references public.loads(id),
  status text,
  notes text,
  updated_by uuid references public.users(id),
  created_at timestamptz default now()
);

CREATE TABLE public.driver_payments (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references public.drivers(id),
  load_id uuid references public.loads(id),
  amount numeric,
  method text,
  status text default 'pending' check (status in ('pending','paid')),
  paid_date date,
  notes text
);

CREATE TABLE public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.users(id),
  status text default 'draft' check (status in ('draft','approved','sent','paid')),
  total_amount numeric default 0,
  notes text,
  approved_by uuid references public.users(id),
  approved_at timestamptz,
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);

CREATE TABLE public.invoice_loads (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id),
  load_id uuid references public.loads(id)
);

CREATE TABLE public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id),
  load_id uuid references public.loads(id),
  type text check (type in
    ('base_price','service_fee','tire_change','battery','key_fix','repair','surcharge','other')),
  description text,
  amount numeric,
  created_at timestamptz default now()
);

-- Indexes on every FK, matching existing schema convention. loads_status_history
-- and invoice_line_items customer policies below join through these at query time.
CREATE INDEX loads_customer_id_idx ON public.loads(customer_id);
CREATE INDEX loads_driver_id_idx ON public.loads(driver_id);
CREATE INDEX load_status_history_load_id_idx ON public.load_status_history(load_id);
CREATE INDEX driver_payments_driver_id_idx ON public.driver_payments(driver_id);
CREATE INDEX driver_payments_load_id_idx ON public.driver_payments(load_id);
CREATE INDEX invoices_customer_id_idx ON public.invoices(customer_id);
CREATE INDEX invoice_loads_invoice_id_idx ON public.invoice_loads(invoice_id);
CREATE INDEX invoice_loads_load_id_idx ON public.invoice_loads(load_id);
CREATE INDEX invoice_line_items_invoice_id_idx ON public.invoice_line_items(invoice_id);
CREATE INDEX invoice_line_items_load_id_idx ON public.invoice_line_items(load_id);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.drivers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.load_status_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.driver_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_loads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_line_items TO authenticated;

GRANT ALL ON public.drivers TO service_role;
GRANT ALL ON public.loads TO service_role;
GRANT ALL ON public.load_status_history TO service_role;
GRANT ALL ON public.driver_payments TO service_role;
GRANT ALL ON public.invoices TO service_role;
GRANT ALL ON public.invoice_loads TO service_role;
GRANT ALL ON public.invoice_line_items TO service_role;

-- Admins: full access to every new table.
CREATE POLICY "Admins manage drivers" ON public.drivers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage loads" ON public.loads
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage load status history" ON public.load_status_history
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage driver payments" ON public.driver_payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage invoice loads" ON public.invoice_loads
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage invoice line items" ON public.invoice_line_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Customers: read-only, scoped to their own customer_id. drivers, driver_payments,
-- and invoice_loads have no customer policy at all — internal-only by omission.
CREATE POLICY "Customers view own loads" ON public.loads
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers view own load status history" ON public.load_status_history
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.loads l
    WHERE l.id = load_status_history.load_id AND l.customer_id = auth.uid()
  ));

CREATE POLICY "Customers view own invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers view own invoice line items" ON public.invoice_line_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_line_items.invoice_id AND i.customer_id = auth.uid()
  ));
