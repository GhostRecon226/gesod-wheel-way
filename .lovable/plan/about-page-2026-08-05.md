# About page

Create `/about` using the content from the attached document, styled to the existing dark theme.

## Page structure

1. **Hero** — eyebrow "Vehicle Sourcing & Logistics", H1 "About GESOD RIDES", intro paragraph about connecting customers with auction opportunities and coordinating vehicle movement from U.S. auctions worldwide.

2. **Who We Are** — two paragraphs (facilitation/logistics coordination company, does not manufacture or sell vehicles; transparency and structured processes, documented and tracked steps, accurate information over promises), alongside an **Our Approach** card listing:
   - Process-driven operations with clear milestones
   - Transparent communication at every stage
   - Documented workflows and status tracking
   - No hidden fees or surprise charges
   - Realistic expectations, not exaggerated promises
   
   Plus the closing line about first-time buyers and fleet importers alike.

3. **What We Do** — 2x2 card grid with icons: Auction Sourcing Support (Copart/IAAI listings), Bid-on-Behalf Services (you set the max bid), Ocean Freight Coordination (RORO and container), Inland Vehicle Towing (auction yard to port).

4. **What We Do Not Do** — list of four boundaries with bold headings and explanation: do not own auction vehicles, do not guarantee auction outcomes, do not control customs authorities, do not guarantee vehicle condition.

5. **Why Work With Us** — 4 cards: Structured Process, Status-Based VIN Tracking, Centralized Documentation, Clear Communication.

6. **Ready to Get Started?** — CTA with buttons "View Auction Listings" (→ `/listings`) and "Request a Quote" (→ `/quote`).

## Navigation

- Register `/about` in `src/App.tsx`.
- Add "About" to the Navbar (after Home) and to the footer Quick Links.

## Technical notes

- New file `src/pages/About.tsx` wrapped in `PublicLayout`, following the section/card patterns already used in `HowItWorks.tsx`.
- Content held in local data arrays and rendered via map; no backend or schema changes.
- Semantic tokens only (`bg-background`, `bg-card`, `text-silver`, `text-copper`, `text-gold`, `border-border`) and existing Button variants; single H1, responsive grids collapsing to one column on mobile.
- Icons from lucide-react: Building2, CheckCircle2, Gavel, Ship, MapPin, ShieldCheck, FileText, MessageSquare, XCircle, ArrowRight.
- Page-level document title and meta description for SEO.
- No images pulled from the PDF — icons and type only, matching the rest of the site.
