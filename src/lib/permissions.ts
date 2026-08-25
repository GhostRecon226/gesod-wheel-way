export type AppRole = "customer" | "admin";

export type Module =
  | "overview"
  | "customers"
  | "vehicles"
  | "listings"
  | "bids"
  | "quotes"
  | "documents"
  | "payments"
  | "disputes"
  | "schedules"
  | "notifications"
  | "watchlist"
  | "reports"
  | "import"
  | "messages"
  | "loads"
  | "drivers"
  | "invoices";

export type Action = "view" | "create" | "edit" | "delete" | "export" | "review";

type Matrix = Record<AppRole, Partial<Record<Module, Action[]>>>;

/**
 * Single source of truth for module-level permissions in the UI.
 * Server-side enforcement stays with RLS policies; this only shapes what the UI offers.
 */
export const PERMISSIONS: Matrix = {
  admin: {
    overview: ["view"],
    customers: ["view", "create", "edit", "delete", "export"],
    vehicles: ["view", "create", "edit", "delete", "export"],
    listings: ["view", "create", "edit", "delete", "export"],
    bids: ["view", "edit", "delete", "export"],
    quotes: ["view", "edit", "delete", "export"],
    documents: ["view", "create", "edit", "delete", "export", "review"],
    payments: ["view", "create", "edit", "delete", "export"],
    disputes: ["view", "edit", "delete", "export"],
    schedules: ["view", "create", "edit", "delete", "export"],
    notifications: ["view", "create", "edit"],
    watchlist: ["view"],
    reports: ["view", "export"],
    import: ["view", "edit", "export"],
    messages: ["view", "edit"],
    loads: ["view", "create", "edit", "delete"],
    drivers: ["view", "create", "edit", "delete"],
    invoices: ["view", "create", "edit"],
  },
  customer: {
    vehicles: ["view"],
    listings: ["view"],
    bids: ["view", "create"],
    quotes: ["view", "create"],
    documents: ["view", "create"],
    payments: ["view"],
    disputes: ["view", "create"],
    schedules: ["view"],
    notifications: ["view", "edit"],
    watchlist: ["view", "create", "delete"],
    invoices: ["view"],
  },
};

export const can = (
  role: AppRole | null,
  module: Module,
  action: Action = "view",
): boolean => {
  if (!role) return false;
  return PERMISSIONS[role]?.[module]?.includes(action) ?? false;
};

export const allowedModules = (role: AppRole | null): Module[] => {
  if (!role) return [];
  return Object.keys(PERMISSIONS[role] ?? {}) as Module[];
};
