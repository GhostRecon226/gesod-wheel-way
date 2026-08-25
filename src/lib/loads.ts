export interface Load {
  id: string;
  vin: string;
  lot_number: string | null;
  buyer_number: string | null;
  customer_id: string | null;
  driver_id: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  pickup_location: string | null;
  destination_type: string | null;
  destination_address: string | null;
  agreed_pickup_price: number | null;
  service_fee: number | null;
  status: string | null;
  notes: string | null;
  created_at: string;
}

export const LOAD_STATUSES = [
  { value: "posted", label: "Posted", color: "#94A3B8" },
  { value: "driver_assigned", label: "Driver Assigned", color: "#C47B2B" },
  { value: "picked_up", label: "Picked Up", color: "#E8A020" },
  { value: "in_transit", label: "In Transit", color: "#3B82F6" },
  { value: "delivered", label: "Delivered", color: "#22C55E" },
  { value: "invoiced", label: "Invoiced", color: "#8B5CF6" },
  { value: "paid", label: "Paid", color: "#10B981" },
] as const;

export type LoadStatusValue = (typeof LOAD_STATUSES)[number]["value"];

export const loadStatusMeta = (status: string | null) =>
  LOAD_STATUSES.find((s) => s.value === status) ?? LOAD_STATUSES[0];

export const DESTINATION_TYPES = [
  { value: "port", label: "Port" },
  { value: "yard", label: "Yard" },
  { value: "container", label: "Container" },
  { value: "residence", label: "Residence" },
] as const;

export const loadTitle = (l: Pick<Load, "year" | "make" | "model">) =>
  [l.year, l.make, l.model].filter(Boolean).join(" ") || "Vehicle";
