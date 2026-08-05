# Rebuild the quote form step to match the reference

The second step of `/quote` (shown after choosing a service type) gets restructured to match the attached mockup, styled in the existing GESOD dark theme rather than the light mockup palette.

## Layout

```text
← Back to Quote Options

┌──────────────────────────────────────────────┐
│ [icon]  Ocean Freight (RORO) Quote           │
│         Roll-on/Roll-off shipping...         │
│                                              │
│ Contact Information                          │
│ Full Name* | Email Address* | Phone Number*  │
│                                              │
│ Vehicle Information                          │
│ Vehicle Type* | Make* | Model*               │
│ Year* | VIN (optional - 17 characters)       │
│                                              │
│ Shipping Details                             │
│ Origin Port* | Destination Port*             │
│                                              │
│ Additional Information                       │
│ Auction Source | Lot Number                  │
│ Additional Notes (max 1000 characters)       │
│                                              │
│ [ Quotes are estimates... disclaimer box ]   │
│                        Cancel  Submit Quote  │
└──────────────────────────────────────────────┘
```

## Details

- **Header row**: service icon in a rounded tile, title "Ocean Freight (RORO) Quote" / "Inland Freight (Vehicle Towing) Quote", with a one-line subtitle per service.
- **Back link**: "Back to Quote Options" with a left arrow above the card, returning to the service-selection step.
- **Section headers**: each section gets a title, a short helper line, and a divider rule, as in the mockup.
- **Required markers**: red asterisks on required labels; placeholders match the mockup (e.g. "John Doe", "john@example.com", "+1 (555) 123-4567", "e.g., Toyota", "e.g., Lagos, Nigeria").
- **New fields**: Vehicle Type (select: Sedan, SUV, Truck/Pickup, Van, Motorcycle, Heavy Equipment, Other), Auction Source (select: Copart, IAAI, Manheim, Dealer, Private Seller, Other), Lot Number.
- **VIN**: optional, 17-char limit, helper text "Optional - 17 characters".
- **Notes**: textarea with a "Maximum 1000 characters" helper.
- **Footer**: disclaimer box ("Quotes are estimates and subject to final confirmation..."), then a Cancel button (returns to the selection step and clears the form) and the copper "Submit Quote Request" button.
- **Inland variant**: same structure; the Shipping Details section becomes "Towing Details" with Pickup Location and Delivery Destination, and keeps the existing "Vehicle runs and drives?" toggle. Ocean keeps its marine-insurance toggle in Additional Information.

## Technical notes

- All changes are in `src/pages/Quote.tsx`. No database or RLS changes: the new fields (vehicle type, auction source, lot number) are appended to the existing `vehicle_details` summary string sent to `quote_requests`.
- Existing behaviour is preserved: `?type=` deep-link prefill, login-required submit guard, and the success confirmation panel.
- Field limits stay enforced client-side (`maxLength`, year min/max, VIN 17, notes 1000) and use existing `Input`, `Textarea`, `Button`, and theme tokens — no hardcoded colors.
