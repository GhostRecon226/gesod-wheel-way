# Cleaner Navigation

The top bar currently shows 9 items (Home, About, Listings, Services, Track, Schedule, Get a Quote, FAQ, Contact) plus Login. Reduce it to 5 clear items with two dropdowns.

## New structure

```text
Logo        Services v   Auctions v   Track   Company v        [Get a Quote]  [Login]

Services v            Auctions v           Company v
  Vehicle Sourcing      Browse Listings      About Us
  Ocean Freight         Sailing Schedule     How It Works
  Inland Transport                           FAQ
                                             Contact
```

- Home is reached by the logo, so it leaves the bar.
- Track stays a single top-level link (high-traffic action).
- "Get a Quote" becomes a gold/outline button next to Login instead of a plain text link, so the primary action stands out.
- Adds "How It Works" to the nav (currently only linked from the home page and footer).

## Behaviour

- Desktop: dropdowns open on hover and on click, close on outside click or Escape; each menu tracks its own open state (today all dropdowns share one state, so mobile Services and desktop Services toggle together).
- A parent shows as active when any child route is active.
- Mobile drawer: same groups as collapsible accordions, one open at a time, with Get a Quote and Login as full-width buttons at the bottom.

## Technical notes

- Rework `src/components/Navbar.tsx` only: nav config becomes groups with children, and open-state keyed by group label. No route or page changes; the footer keeps its current links.
- Styling stays on existing semantic tokens (`text-gold`, `bg-card`, `border-border`) and the `copper` button variant.
