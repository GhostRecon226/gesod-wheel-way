# GESOD Rides Hub

I am building a vehicle import and logistics platform called GESOD RIDES.

Connect this project to Supabase and create the following tables:

users (id, name, email, phone, role: enum['customer', 'admin'], created_at)

vehicles (id, vin, make, model, year, title_type, damage_description, 

odometer, run_and_drive: boolean, status, customer_id references users(id), 

auction_source, lot_number, yard_location, auction_date, created_at)

vehicle_milestones (id, vehicle_id references vehicles(id), stage, notes, 

evidence_url, updated_by references users(id), created_at)

bid_requests (id, customer_id references users(id), vehicle_id references 

vehicles(id), max_bid, status: enum['pending', 'approved', 'rejected', 

'won', 'lost'], deposit_status, admin_notes, created_at)

quote_requests (id, customer_id references users(id), type: 

enum['ocean', 'inland'], vehicle_details, status: enum['pending', 'issued', 

'accepted', 'expired'], amount_usd, amount_ngn, valid_until, admin_notes, 

created_at)

auction_listings (id, make, model, year, images, lot_number, auction_source, 

auction_date, yard_location, status: enum['active', 'expired'], created_at)

documents (id, vehicle_id references vehicles(id), type, file_url, 

uploaded_by references users(id), created_at)

payments (id, vehicle_id references vehicles(id), customer_id references 

users(id), stage, amount, currency: enum['USD', 'NGN'], status: 

enum['pending', 'confirmed'], confirmed_by references users(id), payment_date)

disputes (id, vehicle_id references vehicles(id), customer_id references 

users(id), description, status: enum['open', 'under_review', 'resolved'], 

admin_response, evidence_url, created_at)

sailing_schedules (id, vessel_name, departure_port, etd, eta_nigeria, 

destination_port: enum['Apapa', 'Tin Can', 'Onne'], status: 

enum['scheduled', 'departed', 'arrived'], created_at)

notifications (id, user_id references users(id), message, read: boolean, 

created_at)

Set up Supabase row-level security so customers can only view their own 

data. Admins have full access to all tables.

Set up a Supabase storage bucket called vehicle-documents for uploading 

photos and files. Only authenticated users can access it.

Set up the following design tokens as CSS variables globally across 

the entire project. Every page, component, and dashboard must use 

these exact values:

--color-bg: #0D1820

--color-surface: #1A2535

--color-surface-2: #243044

--color-copper: #C47B2B

--color-gold: #E8A020

--color-silver: #E2E8F0

--color-text: #F1F5F9

--color-muted: #94A3B8

--color-border: #2A3A50

--color-success: #22C55E

--color-danger: #EF4444

--color-warning: #F59E0B

Primary brand color: --color-copper (#C47B2B)

Secondary accent: --color-gold (#E8A020)

All backgrounds default to --color-bg

All cards and panels use --color-surface

All borders use --color-border

Global typography:

- Font: Inter (import from Google Fonts)

- Headings: bold, --color-silver

- Body text: --color-text

- Muted/secondary text: --color-muted

- All primary buttons: background --color-copper, text white, 

  rounded-lg, hover darken by 10%

- All secondary buttons: border --color-copper, text --color-copper, 

  transparent background

- Links and active states use --color-gold

Do not build any UI yet. Just confirm the schema, storage, and 

design tokens are set up correctly.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://gesod-wheel-way.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c4717432-fb15-44e4-b210-7b2fb8aba938).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
