export interface AuctionListing {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  images: string[] | null;
  lot_number: string | null;
  auction_source: string | null;
  auction_date: string | null;
  yard_location: string | null;
  status: string;
  vin: string | null;
  title_type: string | null;
  odometer: number | null;
  primary_damage: string | null;
  secondary_damage: string | null;
  damage_description: string | null;
  run_and_drive: boolean | null;
  has_keys: boolean | null;
  estimated_value: number | null;
  body_style: string | null;
  engine: string | null;
  transmission: string | null;
  drivetrain: string | null;
  fuel_type: string | null;
  exterior_color: string | null;
  interior_color: string | null;
}

export function listingTitle(l: Pick<AuctionListing, "year" | "make" | "model">) {
  return `${l.year ?? ""} ${l.make ?? ""} ${l.model ?? ""}`.trim() || "Vehicle";
}

export function formatMiles(odometer: number | null) {
  if (odometer == null) return null;
  return `${odometer.toLocaleString()} mi`;
}

export function formatUsd(value: number | null) {
  if (value == null) return null;
  return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
