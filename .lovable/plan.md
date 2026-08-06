# Remove em dashes across the site

Replace every long dash (— and –) in user-visible text across the public site and the admin/customer dashboards.

## Replacement rules

| Where it appears | Current | Becomes |
| --- | --- | --- |
| Sentence dash in copy | `auctions — you provide` | comma or period rewrite: `auctions, and you provide` |
| Numeric ranges | `4–6 weeks`, `$150–$600`, `8–15%`, `Mon–Fri` | `4-6 weeks`, `$150-$600`, `8-15%`, `Mon-Fri` |
| Empty-cell placeholders in tables | `"—"` | `"-"` |
| Select dropdown placeholders | `— Select vehicle —` | `Select vehicle` |
| Titles / headings | `GESOD RIDES — Vehicle Import`, `Add Milestone — Toyota` | `GESOD RIDES: Vehicle Import`, `Add Milestone: Toyota` |

## Files touched

Public pages: `index.html` (title, meta, og/twitter tags), `Index.tsx`, `About.tsx`, `Contact.tsx`, `FAQ.tsx`, `Quote.tsx`, `SailingSchedule.tsx`, `StyleGuide.tsx`, `services/RoroService.tsx`, `services/TowingService.tsx`, `services/BiddingService.tsx`.

Admin components: `AdminListings`, `AdminImportPipeline`, `AdminVehicles`, `AdminSchedules`, `AdminPayments`, `AdminQuotes`, `AdminDocuments`, `AdminBids`, `AdminNotifications`, `AdminCustomers`.

Customer components: `CustomerQuotes`, `CustomerDocuments`, `CustomerPayments`, `CustomerBids`, `CustomerDisputes`.

Backend code comments in `supabase/functions/process-email-queue/index.ts` will also be cleaned (comments only, no logic change).

## Notes

- Sentence-level dashes are rewritten for grammar, not blindly swapped for hyphens, so copy still reads correctly.
- No layout, styling, or data-logic changes; text only.
- After the edits a repo-wide search confirms zero `—`/`–` characters remain.
