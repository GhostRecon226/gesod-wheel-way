-- Demo/QA seed data for the two qa-customer* accounts and general
-- browsing content, so the Playwright suite has something to assert on
-- and there's something to show at handover. Depends on the QA accounts
-- (qa-admin@gesodrides.com, qa-customer1@gesodrides.com,
-- qa-customer2@gesodrides.com) already existing in auth.users — run
-- scripts/seed-qa-accounts.mjs (or create them via the Dashboard) first.
--
-- Every insert is guarded so this migration is safe to re-run.

-- 3 auction listings (public inventory, no customer assignment)
INSERT INTO public.auction_listings (
  vin, make, model, year, lot_number, auction_source, auction_date, yard_location,
  title_type, odometer, primary_damage, run_and_drive, has_keys, estimated_value,
  body_style, engine, transmission, drivetrain, fuel_type, exterior_color, interior_color, status
)
SELECT 'QADEMOAUC00000101', 'Toyota', 'Camry', 2019, 'QA-LOT-101', 'Copart', CURRENT_DATE + 7, 'Dallas, TX',
  'Clean', 42000, 'Front End', true, true, 12500,
  'Sedan', '2.5L I4', 'Automatic', 'FWD', 'Gasoline', 'Silver', 'Black', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.auction_listings WHERE vin = 'QADEMOAUC00000101');

INSERT INTO public.auction_listings (
  vin, make, model, year, lot_number, auction_source, auction_date, yard_location,
  title_type, odometer, primary_damage, run_and_drive, has_keys, estimated_value,
  body_style, engine, transmission, drivetrain, fuel_type, exterior_color, interior_color, status
)
SELECT 'QADEMOAUC00000102', 'Honda', 'Accord', 2020, 'QA-LOT-102', 'IAAI', CURRENT_DATE + 5, 'Houston, TX',
  'Salvage', 31000, 'Rear End', true, true, 14200,
  'Sedan', '1.5L Turbo I4', 'Automatic', 'FWD', 'Gasoline', 'White', 'Gray', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.auction_listings WHERE vin = 'QADEMOAUC00000102');

INSERT INTO public.auction_listings (
  vin, make, model, year, lot_number, auction_source, auction_date, yard_location,
  title_type, odometer, primary_damage, run_and_drive, has_keys, estimated_value,
  body_style, engine, transmission, drivetrain, fuel_type, exterior_color, interior_color, status
)
SELECT 'QADEMOAUC00000103', 'Ford', 'F-150', 2018, 'QA-LOT-103', 'Copart', CURRENT_DATE + 10, 'Atlanta, GA',
  'Clean', 58000, 'Side', true, false, 21000,
  'Pickup Truck', '3.5L V6 EcoBoost', 'Automatic', '4WD', 'Gasoline', 'Blue', 'Black', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.auction_listings WHERE vin = 'QADEMOAUC00000103');

-- 2 vehicles, one per QA customer
INSERT INTO public.vehicles (
  vin, make, model, year, title_type, damage_description, odometer, run_and_drive,
  status, customer_id, auction_source, lot_number, yard_location, auction_date
)
SELECT 'QADEMOVEH00000001', 'Toyota', 'Camry', 2019, 'Clean', 'Front End', 42000, true,
  'In Transit', u.id, 'Copart', 'QA-LOT-101', 'Dallas, TX', CURRENT_DATE - 14
FROM public.users u
WHERE u.email = 'qa-customer1@gesodrides.com'
  AND NOT EXISTS (SELECT 1 FROM public.vehicles WHERE vin = 'QADEMOVEH00000001');

INSERT INTO public.vehicles (
  vin, make, model, year, title_type, damage_description, odometer, run_and_drive,
  status, customer_id, auction_source, lot_number, yard_location, auction_date
)
SELECT 'QADEMOVEH00000002', 'Honda', 'Accord', 2020, 'Salvage', 'Rear End', 31000, true,
  'Awaiting Customs Clearance', u.id, 'IAAI', 'QA-LOT-102', 'Houston, TX', CURRENT_DATE - 21
FROM public.users u
WHERE u.email = 'qa-customer2@gesodrides.com'
  AND NOT EXISTS (SELECT 1 FROM public.vehicles WHERE vin = 'QADEMOVEH00000002');

-- Milestones for each vehicle, matching its current status
INSERT INTO public.vehicle_milestones (vehicle_id, stage, notes)
SELECT v.id, m.stage, m.notes
FROM public.vehicles v
CROSS JOIN (VALUES
  ('Purchased at Auction', 'Won at Copart auction, payment confirmed.'),
  ('Inland Transport to Port', 'Picked up from yard, en route to port of departure.'),
  ('Loaded on Vessel', 'Vehicle loaded and vessel departed for Nigeria.')
) AS m(stage, notes)
WHERE v.vin = 'QADEMOVEH00000001'
  AND NOT EXISTS (
    SELECT 1 FROM public.vehicle_milestones vm WHERE vm.vehicle_id = v.id AND vm.stage = m.stage
  );

INSERT INTO public.vehicle_milestones (vehicle_id, stage, notes)
SELECT v.id, m.stage, m.notes
FROM public.vehicles v
CROSS JOIN (VALUES
  ('Purchased at Auction', 'Won at IAAI auction, payment confirmed.'),
  ('Arrived at Nigerian Port', 'Vessel arrived at Apapa port.'),
  ('Customs Clearance In Progress', 'Documentation submitted, awaiting duty assessment.')
) AS m(stage, notes)
WHERE v.vin = 'QADEMOVEH00000002'
  AND NOT EXISTS (
    SELECT 1 FROM public.vehicle_milestones vm WHERE vm.vehicle_id = v.id AND vm.stage = m.stage
  );

-- 1 sailing schedule
INSERT INTO public.sailing_schedules (vessel_name, departure_port, etd, eta_nigeria, destination_port, status)
SELECT 'MV Grand Voyager', 'Houston, TX', CURRENT_DATE - 7, CURRENT_DATE + 21, 'Apapa', 'departed'
WHERE NOT EXISTS (SELECT 1 FROM public.sailing_schedules WHERE vessel_name = 'MV Grand Voyager');

-- 1 driver
INSERT INTO public.drivers (name, phone, email, payment_method, payment_details, active)
SELECT 'QA Demo Driver', '+1-555-0100', 'qa-driver@gesodrides.com', 'zelle', 'zelle: +1-555-0100', true
WHERE NOT EXISTS (SELECT 1 FROM public.drivers WHERE email = 'qa-driver@gesodrides.com');

-- 1 load, linking the QA driver to qa-customer1
INSERT INTO public.loads (
  vin, lot_number, customer_id, driver_id, make, model, year,
  pickup_location, destination_type, destination_address, agreed_pickup_price, service_fee, status
)
SELECT 'QADEMOLOAD0000201', 'QA-LOT-201', u.id, d.id, 'Nissan', 'Altima', 2021,
  'Dallas, TX Yard', 'port', 'Houston, TX Port', 450, 50, 'posted'
FROM public.users u, public.drivers d
WHERE u.email = 'qa-customer1@gesodrides.com'
  AND d.email = 'qa-driver@gesodrides.com'
  AND NOT EXISTS (SELECT 1 FROM public.loads WHERE vin = 'QADEMOLOAD0000201');

-- 1 bid request, 1 quote request, 1 payment, 1 dispute — the RLS regression
-- suite's "admin reads every record in %s" check (CUSTOMER_SCOPED_TABLES)
-- requires at least one row in each of these, same as vehicles.
INSERT INTO public.bid_requests (customer_id, vehicle_id, max_bid, status, deposit_status)
SELECT u.id, v.id, 13000, 'pending', 'unpaid'
FROM public.users u
JOIN public.vehicles v ON v.vin = 'QADEMOVEH00000001'
WHERE u.email = 'qa-customer1@gesodrides.com'
  AND NOT EXISTS (SELECT 1 FROM public.bid_requests WHERE customer_id = u.id AND vehicle_id = v.id);

INSERT INTO public.quote_requests (customer_id, type, vehicle_details, status, amount_usd, amount_ngn)
SELECT u.id, 'ocean', '2019 Toyota Camry, sedan, non-running', 'issued', 1450, 2320000
FROM public.users u
WHERE u.email = 'qa-customer1@gesodrides.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.quote_requests WHERE customer_id = u.id AND vehicle_details = '2019 Toyota Camry, sedan, non-running'
  );

INSERT INTO public.payments (customer_id, vehicle_id, stage, amount, currency, status)
SELECT u.id, v.id, 'Auction Settlement', 12500, 'USD', 'confirmed'
FROM public.users u
JOIN public.vehicles v ON v.vin = 'QADEMOVEH00000001'
WHERE u.email = 'qa-customer1@gesodrides.com'
  AND NOT EXISTS (SELECT 1 FROM public.payments WHERE customer_id = u.id AND vehicle_id = v.id AND stage = 'Auction Settlement');

INSERT INTO public.disputes (customer_id, vehicle_id, description, status)
SELECT u.id, v.id, 'Vehicle arrived with additional undisclosed rear-end damage not listed on the auction sheet.', 'open'
FROM public.users u
JOIN public.vehicles v ON v.vin = 'QADEMOVEH00000002'
WHERE u.email = 'qa-customer2@gesodrides.com'
  AND NOT EXISTS (SELECT 1 FROM public.disputes WHERE customer_id = u.id AND vehicle_id = v.id);
