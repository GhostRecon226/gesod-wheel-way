# Quote Service Selection Step

## What changes

Today the home page "Get a Quote" button goes to the contact page, and `/quote` opens the full quote form immediately with an Ocean/Inland toggle at the top.

New flow, modelled on the reference image but styled in the GESOD RIDES dark theme (copper/gold on dark surfaces — not the light grey mockup):

1. Home page "Get a Quote" now links to `/quote`.
2. `/quote` opens on a **Select Service Type** step:
   - Centered header icon, "Request a Quote" title, and the supporting line about providing an estimate based on vehicle and route details.
   - Two selectable cards inside a panel titled "Select Service Type" / "Choose the type of freight service you require":
     - **Ocean Freight (RORO)** — port-to-port vehicle shipping, suitable for cars/SUVs/trucks, typical transit 4–8 weeks.
     - **Inland Freight (Vehicle Towing)** — door-to-door transport, auction pickup and delivery, typical transit 1–7 days.
   - Selected card gets a copper border/accent; "Continue to Quote Form →" button is disabled until one is picked.
3. Continuing reveals the existing quote form, pre-set to the chosen type, with a back link to change the service type. The old top toggle is removed since the choice is now made in step 1.
4. Below the panel: an "Important Notice" block (estimates subject to final confirmation; final pricing confirmed after review; extra charges for oversized/special handling) and the "Already have an account? Log in" line.
5. Existing submission behaviour, validation, and success state stay exactly as they are.

## Technical notes

- Edit `src/pages/Quote.tsx`: add a `step` state (`"select" | "form"`), extract the service-type chooser into a small component in the same file, keep `type` state driving the existing form fields.
- Edit `src/pages/Index.tsx`: hero "Get a Quote" `Link to="/quote"`.
- Use existing semantic tokens (`bg-card`, `border-border`, `text-silver`, `text-copper`, `text-gold`, `variant="copper"`) — no hardcoded colours, no new route needed.
