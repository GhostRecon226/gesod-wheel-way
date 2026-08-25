export interface Driver {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  payment_method: string | null;
  payment_details: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface DriverPayment {
  id: string;
  driver_id: string | null;
  load_id: string | null;
  amount: number | null;
  method: string | null;
  status: string;
  paid_date: string | null;
  notes: string | null;
}

// Colors match the palette already introduced for load statuses (in_transit's
// blue, posted's muted gray) so the two modules read as one system.
export const PAYMENT_METHODS = [
  { value: "zelle", label: "Zelle", color: "#22C55E" },
  { value: "ach", label: "ACH", color: "#3B82F6" },
  { value: "other", label: "Other", color: "#94A3B8" },
] as const;

export const paymentMethodMeta = (method: string | null) =>
  PAYMENT_METHODS.find((m) => m.value === method) ?? PAYMENT_METHODS[2];

// Loads still being worked, i.e. not yet delivered/invoiced/paid.
export const ACTIVE_LOAD_STATUSES = ["posted", "driver_assigned", "picked_up", "in_transit"];
