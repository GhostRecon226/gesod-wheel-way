# Client copy revisions — public site

Apply the client's wording changes from the document. This phase is copy, labels, and the footer disclaimer only — no backend/admin work (that follows in a later plan).

## Home page

Intro/positioning line becomes: "GESOD RIDES coordinates vehicle imports to Nigeria from all over the USA — from auctions, dealerships, or other sources." Supporting bullets updated to the client's revised versions:

- Vehicle sourcing & auction bidding support — we can source vehicles from trusted partners all over the USA to meet your specifications
- Ocean shipping — ocean freight from U.S. ports to international destinations using container or RORO (Roll-on/Roll-off)
- Inland transportation — vehicle transport from anywhere in the USA to your preferred destination or loading port

Service cards renamed and rewritten:

- "Auction Bidding" -> **Vehicle Sourcing Support**: "We can source vehicles from dealerships, auctions, or other sources. We place bids on your behalf at U.S. vehicle auctions — you provide your maximum bid amount and we handle the bidding process."
- "RORO Shipping" -> **Ocean Freight (RORO/Container)**: "We ship your vehicles via Roll-on/Roll-off or container from U.S. ports to international destinations, coordinating with shipping lines to move your vehicle overseas."
- "Inland Towing" -> **Inland Transportation**: "We pick your vehicle up from auction yards, dealerships, or anywhere in the USA and deliver it to the departure port or your preferred drop-off location."

Add a prominent facilitation notice section (larger type than body copy, as the client requested): "GESOD RIDES is a logistics facilitation company. We coordinate services between clients and third-party providers including auction houses, shipping lines, and transport carriers. All quotes are estimates subject to final confirmation. Timelines are indicative and may vary based on external factors."

## Footer

Add the two-paragraph company statement the client specified, with both paragraphs using the same font size/style and aligned to the same left edge:

1. "Vehicle sourcing and logistics facilitation. We coordinate auction bidding, inland transport, and ocean freight services for clients importing vehicles from the United States."
2. "GESOD RIDES is a logistics facilitation company. We do not own vehicles or transport equipment. All services are provided in coordination with third-party partners."

Also add contact details to the footer: email, both phone numbers, and business hours (see Contact below).

## About page

- Intro rewritten: "GESOD RIDES is a vehicle sourcing and logistics facilitation company. We assist customers in purchasing vehicles from trusted USA partners and coordinate the movement of vehicles from across the USA to destinations worldwide. Our focus is efficient, cost-effective solutions that help customers save money and simplify the burden of vehicle importation."
- "Auction Sourcing Support" -> **Vehicle Sourcing Support**: "We help you source vehicles from auto dealers and major U.S. auction platforms like Copart and IAAI. We provide information on available listings to help you make informed decisions."
- "Inland Vehicle Towing" -> **Inland Vehicle Transportation**: "We arrange inland ground transportation from anywhere in the USA to ports or designated drop-off locations within the United States. Pricing depends on distance and vehicle condition."

## Services naming (site-wide)

- "Auction Bidding" / "Auction Vehicle" -> **Vehicle Sourcing** in the navbar, footer, and home cards.
- "Inland Towing" / "Inland Freight" -> **Inland Transportation** in the navbar, footer, home cards, and the quote flow's service-selection card and form heading.
- Bidding service page title -> **Vehicle Sourcing & Auction Bidding Support**, with the added paragraph: "GESOD RIDES can also help source and coordinate outright purchase of vehicles from dealers all across the USA." Existing paragraphs about salvage/clean-title auction access, bid-on-behalf requests, and post-win logistics coordination are kept and aligned to the client's wording.
- Towing service page title -> **Inland Transportation**, with pickup copy widened from "auction yard" to anywhere in the USA.

## Contact page

Add a contact details block above the form:

- Email: contact@gesodrides.com
- Phone: +1 (302) 293-7210 or +234 809 394 3763
- Hours: Mon–Fri, 9:00 AM – 6:00 PM EST

## Technical notes

- Files touched: `src/pages/Index.tsx`, `src/pages/About.tsx`, `src/pages/Contact.tsx`, `src/components/Footer.tsx`, `src/components/Navbar.tsx`, `src/pages/services/BiddingService.tsx`, `src/pages/services/TowingService.tsx`, and the service labels in `src/pages/Quote.tsx`.
- Routes stay the same (`/services/bidding`, `/services/towing`) so existing links and the `?type=ocean|inland` quote params keep working; only labels change.
- Existing semantic tokens and Button variants only; no new dependencies, no schema or data changes.
- Verify each changed page in the preview at desktop and mobile widths after the edits.

## Not in this phase

The document's admin/backend requests are deferred to a follow-up plan: customer create/edit/delete with template upload, vehicle VIN import/export template, Add Vehicle required-field changes, Vehicles & VINs filter by customer name, title-case vehicle display, the Status Updates page rework (columns, VIN last-6 search, filters, VIN detail drill-in), the expanded status list with required document uploads, the Invoices section (auto-created on driver assignment, admin enters USD amounts, finalized at delivery), and best-effort auction-listing autofill from a Copart lot URL.

Also flagged from the document: the client asks whether email support on `contact@gesodrides.com` is included — worth confirming with them separately.
