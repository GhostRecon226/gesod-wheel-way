export interface Invoice {
  id: string;
  customer_id: string | null;
  status: string;
  total_amount: number;
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  load_id: string | null;
  type: string;
  description: string | null;
  amount: number;
  created_at: string;
}

export const INVOICE_STATUSES = [
  { value: "draft", label: "Draft", color: "#94A3B8" },
  { value: "approved", label: "Approved", color: "#C47B2B" },
  { value: "sent", label: "Sent", color: "#3B82F6" },
  { value: "paid", label: "Paid", color: "#22C55E" },
] as const;

export type InvoiceStatusValue = (typeof INVOICE_STATUSES)[number]["value"];

export const invoiceStatusMeta = (status: string | null) =>
  INVOICE_STATUSES.find((s) => s.value === status) ?? INVOICE_STATUSES[0];

// Every value the invoice_line_items.type check constraint allows.
export const LINE_ITEM_TYPES = [
  { value: "base_price", label: "Base Pickup Price" },
  { value: "service_fee", label: "Service Fee" },
  { value: "tire_change", label: "Tire Change" },
  { value: "battery", label: "Battery" },
  { value: "key_fix", label: "Key Fix" },
  { value: "repair", label: "Repair" },
  { value: "surcharge", label: "Surcharge" },
  { value: "other", label: "Other" },
] as const;

export const lineItemTypeLabel = (type: string) =>
  LINE_ITEM_TYPES.find((t) => t.value === type)?.label ?? type;

// Base price and service fee are auto-added per load; only these remain as
// admin-selectable options for the "Add Extra Charge" row.
export const EXTRA_CHARGE_TYPES = LINE_ITEM_TYPES.filter(
  (t) => t.value !== "base_price" && t.value !== "service_fee"
);

export const DEFAULT_SERVICE_FEE = 50;

export const invoiceRef = (id: string) => `INV-${id.slice(0, 8).toUpperCase()}`;

// A line item being edited client-side, before it's persisted. `id` is set
// only when the row already exists in invoice_line_items (edit mode), so
// callers can diff drafts against the original rows to know what to
// insert/update/delete.
export interface LineItemDraft {
  key: string;
  id?: string;
  load_id: string;
  type: string;
  description: string;
  amount: number;
}

let draftKeySeq = 0;
export const nextDraftKey = () => `draft-${++draftKeySeq}`;

