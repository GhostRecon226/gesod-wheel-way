# Auction Listings: Photos + Full Vehicle Detail Page

Good call. Right now all 5 seeded listings have no images at all, and each card only shows make/model/year, lot number, yard and auction date. That is not enough for someone to commit to a bid on a salvage car. The fix is photos plus a proper detail page with condition data.

## What changes for visitors

**Browse Listings grid**
- Each card shows a real photo (first image), with a small "N photos" indicator.
- Cards get quick-scan chips: title type (Clean / Salvage), odometer, run-and-drive, and primary damage.
- Whole card is clickable and opens the car's own page. "Request Bid" stays on the card.

**New vehicle detail page (`/listings/:id`)**
- Photo gallery: large main image, thumbnail strip, click to enlarge, arrow navigation.
- Header: year make model, auction source badge, lot number, estimated value.
- Condition & damage panel: primary damage, secondary damage, damage description, run-and-drive, keys.
- Specs panel: VIN (masked to first 4 + last 4 per our standard), body style, engine, transmission, drivetrain, fuel, exterior/interior color.
- Auction info panel: source, lot number, yard location, auction date, title type, odometer.
- Third-party disclaimer repeated on the page.
- Sticky "Request Bid" action that opens the existing bid request modal.

**Sample photos now**
- Generate realistic auction-yard photos (front, angled, rear, interior) for the 5 existing listings so the page looks complete immediately: light-to-moderate front-end collision damage on some, clean units on others. These get attached to the current test listings.

## What changes for admins

- Listing form gains the new fields: primary/secondary damage, damage description, run-and-drive, keys, title type, odometer, estimated value, VIN, body style, engine, transmission, drivetrain, fuel, colors.
- Multi-image upload (select several files at once) with thumbnail previews, remove buttons, and reordering so the first image is the cover photo.
- Admin table shows a thumbnail and photo count per listing.

## Technical notes

- Migration on `public.auction_listings` adding nullable columns: `vin`, `title_type`, `odometer`, `primary_damage`, `secondary_damage`, `damage_description`, `run_and_drive`, `has_keys`, `estimated_value`, `body_style`, `engine`, `transmission`, `drivetrain`, `fuel_type`, `exterior_color`, `interior_color`. No RLS change needed — public read of active listings already exists.
- Listing photos currently upload into the private `vehicle-documents` bucket and call `getPublicUrl`, which cannot render publicly. Create a dedicated public `auction-images` bucket with admin-only write policies on `storage.objects` and public read, and point listing uploads there. (If the workspace blocks public buckets, fall back to signed URLs and I will flag it.)
- New route `/listings/:id` in `App.tsx`, new `src/pages/ListingDetail.tsx`, extracted `ListingCard` and `ImageGallery` components; VIN masking reuses the existing masking helper.
- Sample photos generated as image files, uploaded to the new bucket, and linked to the 5 listings via a data update.
- Extend the Playwright public suite with detail-page coverage (gallery renders, bid modal opens, invalid id shows 404).
