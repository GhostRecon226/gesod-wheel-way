# How It Works page

Create a dedicated `/how-it-works` page, reached from the home page's "Learn More About Our Process" button.

## Page structure (from the reference)

1. **Dark hero band** — "How It Works" heading, centered intro paragraph: from vehicle selection to delivery, an overview of the steps when working with GESOD RIDES, with defined responsibilities and clear communication points.

2. **Vertical timeline of 6 steps** — each step is a card on the right, with a circular icon badge on a connecting vertical line to the left. Each card: "STEP N" label, title, description, checklist items with check icons, plus optional note box and/or action button.

   - Step 1 — Browse & Select (search icon): auction listings from third-party platforms like Copart and IAAI. Checks: view photos and auction details; check lot numbers and auction dates; research vehicle history independently. Button: "View Auction Listings" → `/listings`.
   - Step 2 — Request a Quote (clipboard icon): quote requests for bidding assistance, inland transport, ocean freight. Checks: specify vehicle and destination details; receive itemized cost estimates; no commitment required. Button: "Request a Quote" → `/quote`.
   - Step 3 — Bidding Assistance (gavel icon): bids placed per max-bid instructions; outcomes depend on competing bidders and reserve prices. Checks: set your maximum bid; we bid to your instructions; receive notification of outcome. Note: "Winning a specific vehicle is not guaranteed."
   - Step 4 — Inland Transport (truck icon): pickup from auction yard, transport to designated port/location in the US. Checks: pickup from auction yard; transport to origin port; handling of drivable and non-drivable vehicles.
   - Step 5 — Ocean Freight (ship icon): RORO shipping from U.S. ports to destination port; transit times vary by route and carrier. Checks: vessel booking and documentation; port-to-port shipping; Bill of Lading issuance. Note: "Transit times are indicative and subject to change."
   - Step 6 — Status Updates (map-pin icon): VIN tracking with status updates at key milestones. Checks: status-based milestone tracking; updates via customer portal; document access through dashboard. Button: "Learn About VIN Tracking" → `/track`.

3. **Important Information** — 2x2 grid of info cards: Service Scope (logistics coordination only; works with third-party auction houses, carriers, shipping lines; does not own vehicles or transport equipment), Timelines (indicative estimates; depend on carrier schedules, weather, port operations, customs), Auction Outcomes (winning not guaranteed; depends on competing bidders, reserve prices, auction conditions), Destination Responsibilities (customs clearance, import duties, destination port fees are the client's responsibility; documentation support only).

4. **Closing CTA** — "Ready to Learn More?" with subtitle, and two buttons: "View Our Services" (→ `/services/roro`) and "Browse Auction Listings" (→ `/listings`).

## Technical notes

- New file `src/pages/HowItWorks.tsx` wrapped in `PublicLayout`; step/info content as local data arrays rendered in a map.
- Register route `/how-it-works` in `src/App.tsx`.
- Point the home page button in `src/pages/Index.tsx` at `/how-it-works` instead of `/faq`.
- Add "How It Works" to the footer link list (Navbar left as-is to avoid crowding) — say the word if you want it in the top nav too.
- Styling uses existing semantic tokens (`bg-background`, `bg-card`, `text-silver`, `text-copper`, `text-gold`, `border-border`) and existing Button variants; the reference's light background is adapted to the project's dark theme. Timeline line is a bordered pseudo/absolute element behind the icon badges; stacks to single column on mobile.
- Icons from lucide-react: Search, ClipboardList, Gavel, Truck, Ship, MapPin, CheckCircle2, Info, ArrowRight.
- Page-level SEO: document title and meta description for the page.
