# Import Auction Listings from a Copart / IAAI Link

Goal: the admin pastes a Copart or IAAI vehicle URL into the backend, the site pulls the vehicle details and photos, and the existing listing form comes back pre-filled for a quick review before saving.

## What the admin will see

1. In Admin > Auction Listings, a new "Import from auction link" box at the top with a URL field and an Import button.
2. On import, a progress state, then the normal Create Listing dialog opens pre-filled with everything that was found (make, model, year, VIN, lot number, odometer, damage, title type, keys, run-and-drive, estimated value, engine, transmission, drivetrain, fuel, colours, yard location, auction date) plus the imported photos in the photo strip.
3. Fields that could not be read are left blank and marked, so the admin only fills the gaps and clicks Save. Nothing is published until the admin saves.
4. Photos are copied into our own auction-images storage during import, so they never break if the auction removes the page.

## When a link cannot be read

Copart and IAAI actively block automated readers, so some links will fail. The flow degrades in three steps:

1. Try the link directly.
2. If that fails, show a "Paste page details instead" panel: the admin opens the auction page, selects all, copies, and pastes the text (and optionally image URLs) into a box. The text is parsed into the same pre-filled form.
3. If both fail, a clear message points the admin to the existing manual form, which stays fully available.

Expectation to set with the client: the paste-text path is the reliable one. The direct-link path will work sometimes and is a convenience, not a guarantee.

## Technical approach

- New edge function `import-auction-listing`:
  - Admin-only: verifies the JWT and `has_role(uid,'admin')`.
  - Validates the URL (must be a copart.com or iaai.com vehicle/lot URL) with zod.
  - Fetch stage: Firecrawl scrape (markdown + links + screenshot-free) for the page content.
  - Extract stage: send the scraped markdown (or admin-pasted text on the fallback path) to Lovable AI Gateway (`google/gemini-3.5-flash`) with a strict JSON schema matching the `auction_listings` columns; return `{ fields, imageUrls, missing[] }`.
  - Image stage: download each candidate image server-side (cap at 12, size/content-type checked), upload to the existing private `auction-images` bucket with `service_role`, return storage paths so `resolveListingImages` works unchanged.
  - Returns the draft payload; no database write.
- Frontend `AdminListings.tsx`: new `ImportFromLink` sub-component + a `mapDraftToForm` helper that feeds the existing `form`/`existingImages` state, so save/edit logic is untouched.
- Firecrawl: link the existing workspace Firecrawl connection to this project (direct API mode, `fc-` key via `FIRECRAWL_API_KEY`). No new user-supplied secrets needed; Lovable AI Gateway needs no key.
- No schema changes: all target columns already exist on `auction_listings`.
- Optional light audit: store the source URL in `damage_description`? No, instead reuse the existing `auction_source` field for "Copart"/"IAAI" only; source URL is not persisted unless you want a column added later.

## Out of scope

- Bulk import of many links at once.
- Automatic refresh of an imported listing when the auction page changes.
- Bypassing auction-site protections (no credential-based logins or captcha solving).
