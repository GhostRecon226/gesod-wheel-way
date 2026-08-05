# Route all quote CTAs to the new quote flow

Every call-to-action that implies "get a quote" should land on `/quote` (the new service-selection + form flow) instead of the generic contact page.

## Changes

1. **RORO Shipping page** — "Get Shipping Quote" button: `/contact` becomes `/quote?type=ocean` so the ocean freight option is preselected.
2. **Inland Towing page** — "Get Towing Quote" button: `/contact` becomes `/quote?type=inland` so inland towing is preselected.
3. **Home page CTA banner** — the "Contact Us" button stays on `/contact` (it's a general contact CTA), while the hero "Get a Quote" already points at `/quote`.
4. **Contact page** — reword the intro so "need a quote?" links to the quote page instead of implying the contact form is the quote channel.
5. **Navbar + Footer** — add a "Get a Quote" entry pointing to `/quote` so the flow is reachable from any page (desktop nav, mobile menu, and the footer services/company column).
6. **Auction Bidding page** — "Request a Bid" keeps its current destination, since a bid request is a distinct action from a freight quote.

## Quote page behaviour

`/quote` accepts an optional `type` query param (`ocean` or `inland`). When present and valid, the page skips the service-selection step and opens the matching form directly, with the existing "change service type" back link still available. Without the param, the selection step shows as it does today.

## Technical notes

- Files touched: `src/pages/services/RoroService.tsx`, `src/pages/services/TowingService.tsx`, `src/pages/Contact.tsx`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/pages/Quote.tsx`.
- In `Quote.tsx`, read the param with `useSearchParams` and initialise `step`/`selected`/`type` from it; no backend or submission-logic changes.
- Nav/footer additions reuse the existing link arrays and styling — no new components.
