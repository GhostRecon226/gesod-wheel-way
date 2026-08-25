# Storage buckets

Two buckets, both **private** (no public URL access; the app serves files through
signed URLs created in `src/lib/documentStorage.ts` and `src/lib/listingImages.ts`).

| Bucket | Public | File size limit | Allowed MIME types | Contents |
|---|---|---|---|---|
| `vehicle-documents` | no | project default | any | Customer/admin uploaded vehicle paperwork (title, BOL, customs docs) |
| `auction-images` | no | project default | any | Auction listing photos, including images mirrored by the import function |

Buckets cannot be created with plain SQL on Supabase. Create them first, then apply
the `storage.objects` policies from the end of `schema.sql`.

## Create the buckets

Dashboard: Storage → New bucket → name as above, **Public bucket = off**.

Or with the Management/Storage API:

```sh
curl -X POST "https://<your-ref>.supabase.co/storage/v1/bucket" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"id":"vehicle-documents","name":"vehicle-documents","public":false}'

curl -X POST "https://<your-ref>.supabase.co/storage/v1/bucket" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"id":"auction-images","name":"auction-images","public":false}'
```

## Access rules (implemented by the policies in `schema.sql`)

`vehicle-documents`
- Object path convention: `<vehicle_id>/<filename>`.
- A customer may read and upload only under vehicles they own (checked against
  `public.vehicles.customer_id = auth.uid()`).
- Admins (`has_role(auth.uid(), 'admin')`) may read, upload, and delete anything.
- No anonymous access at all.

`auction-images`
- Read: any authenticated user (listings are browsed while signed in; the public
  listing pages fetch signed URLs).
- Insert / update / delete: admins only.
- No anonymous access; the app mints short-lived signed URLs instead.

## Copying the files themselves

Bucket contents are not part of the schema export. To move objects, list and
re-upload with the service-role key:

```sh
# download everything from the old project
supabase storage cp -r ss://vehicle-documents ./vehicle-documents --experimental
supabase storage cp -r ss://auction-images    ./auction-images    --experimental
# then, with the CLI linked to the new project
supabase storage cp -r ./vehicle-documents ss://vehicle-documents --experimental
supabase storage cp -r ./auction-images    ss://auction-images    --experimental
```

Keep the exact object paths: rows in `public.documents.file_url` and
`public.auction_listings.images` reference them.
