# Inland Freight quote form variant

Restructure the inland (Vehicle Towing) branch of the quote form to match the attached reference. The ocean branch stays exactly as it is now; only the inland variant changes shape.

## Section order (inland)

```text
← Back to Quote Options

┌──────────────────────────────────────────────┐
│ [icon] Inland Freight (Vehicle Towing) Quote │
│        Domestic vehicle transport and towing │
│                                              │
│ Contact Information                          │
│ Full Name* | Email Address* | Phone Number*  │
│                                              │
│ Location Details                             │
│ Pickup Location* | Destination Port*         │
│ (helper: Full address or auction yard name)  │
│                                              │
│ Vehicle Information                          │
│ Vehicle Condition* | Vehicle Type*           │
│ (helper: Non-drivable vehicles may require   │
│  special equipment)                          │
│ VIN — Optional - 17 characters               │
│                                              │
│ Additional Information                       │
│ Auction Source | Lot Number                  │
│ Pickup Deadline (date)                       │
│ Additional Notes — Maximum 1000 characters   │
│                                              │
│ [ Quotes are estimates... disclaimer ]       │
│                        Cancel  Submit Quote  │
└──────────────────────────────────────────────┘
```

## Changes

- **Location Details moves above Vehicle Information** for inland, with subtitle "Pickup and destination information". Fields: Pickup Location (placeholder "e.g., Copart Dallas, TX", helper "Full address or auction yard name") and Destination Port (placeholder "e.g., Houston, TX").
- **Vehicle Information** for inland drops Make/Model/Year and instead shows Vehicle Condition (select: Runs and drives, Starts but does not drive, Non-running / inoperable, Wrecked / heavy damage) plus Vehicle Type, with helper "Non-drivable vehicles may require special equipment". VIN stays optional below.
- The existing "Vehicle runs and drives?" toggle is removed for inland — Vehicle Condition replaces it.
- **Additional Information** gains a Pickup Deadline date field with helper "When does the vehicle need to be picked up?", alongside Auction Source and Lot Number, then Additional Notes.
- **Disclaimer** text for inland reads: "Quotes are estimates and subject to final confirmation. Final pricing may vary based on vehicle condition, distance, and special handling requirements."
- Cancel / Submit Quote Request actions and the back link stay as they are.

## Technical notes

- All edits in `src/pages/Quote.tsx`. Form state gains `vehicleCondition` and `pickupDeadline`; both are appended to the `vehicle_details` summary string saved to `quote_requests`, so no database change is needed.
- Make/Model/Year remain in state and stay required for ocean only, so the ocean submission summary is unchanged.
- Section rendering branches on `type`, reusing the existing `Input`, `Textarea`, select styling, and theme tokens. Date field uses a native `type="date"` input styled to match the other fields.
