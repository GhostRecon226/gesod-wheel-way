# Exporting and reloading data

`schema.sql` contains structure only. This covers the rows.

## 1. Get the data out

In Lovable: **Cloud → Advanced settings → Export data**. That produces a dump of your
project data (public schema plus auth users).

For a specific table or query you can also export CSV yourself, for example:

```sh
psql "$OLD_DATABASE_URL" -c "COPY (SELECT * FROM public.vehicles) TO STDOUT WITH CSV HEADER" > vehicles.csv
```

## 2. Auth users

Rows in `auth.users` are not part of `schema.sql`. Options:

- Use the export from step 1, which includes the auth schema; load it into the new
  project before the public data so `user_id` references resolve.
- Or recreate users through the Admin API (`auth.admin.createUser`) / the
  `admin-create-customer` function in invite mode. In that case user UUIDs change and
  you must remap `customer_id` / `user_id` / `uploaded_by` columns.

Password hashes only survive the dump path, not the recreate path.

## 3. Load order (foreign keys)

Insert in this order:

```text
1  users                    (references auth.users ids)
2  user_roles
3  drivers
4  auction_listings
5  vehicles
6  vehicle_milestones
7  bid_requests
8  quote_requests
9  payments
10 documents
11 disputes
12 notifications
13 auction_watchlist
14 sailing_schedules
15 contact_messages
16 loads
17 load_status_history
18 driver_payments
19 invoices
20 invoice_loads
21 invoice_line_items
22 email_send_state, email_send_log, email_unsubscribe_tokens, suppressed_emails
```

Reverse this order when deleting.

## 4. Loading with RLS in the way

Load as the `postgres` / service role (RLS is bypassed) — do not load through the Data
API with the anon key.

```sh
cat vehicles.csv | psql "$NEW_DATABASE_URL" -c "COPY public.vehicles FROM STDIN WITH CSV HEADER"
```

`public.handle_new_user()` fires on `auth.users` insert and writes `public.users` +
`public.user_roles`. If you are restoring those tables from a dump, drop the
`on_auth_user_created` trigger first and recreate it after the load to avoid conflicts
(the function is `ON CONFLICT DO NOTHING`, so duplicates are harmless but roles may
default to `customer`).

## 5. Storage objects

Files are separate again, see `storage.md`. `public.documents.file_url` and
`public.auction_listings.images` store object paths, so paths must be preserved.
