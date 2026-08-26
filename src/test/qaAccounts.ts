/**
 * Shared QA test accounts used by both the RLS regression suite (vitest) and the
 * end-to-end smoke tests (Playwright).
 *
 * These are disposable accounts on the project's own backend, created purely for
 * automated QA. Override the password with QA_TEST_PASSWORD if it is rotated.
 */
export const QA_PASSWORD = process.env.QA_TEST_PASSWORD ?? "GesodQa!2026";

export interface QaAccount {
  label: string;
  email: string;
  password: string;
  role: "admin" | "customer";
  /** Expected landing route after sign-in. */
  dashboard: string;
  /** True when the account owns seeded records (vehicles, bids, quotes, etc.). */
  hasData: boolean;
}

export const ADMIN: QaAccount = {
  label: "QA Admin",
  email: "qa-admin@gesodrides.com",
  password: QA_PASSWORD,
  role: "admin",
  dashboard: "/dashboard/admin",
  hasData: false,
};

export const CUSTOMERS: QaAccount[] = [
  {
    label: "QA Customer 1",
    email: "qa-customer1@gesodrides.com",
    password: QA_PASSWORD,
    role: "customer",
    dashboard: "/dashboard/customer",
    hasData: true,
  },
  {
    label: "QA Customer 2",
    email: "qa-customer2@gesodrides.com",
    password: QA_PASSWORD,
    role: "customer",
    dashboard: "/dashboard/customer",
    hasData: true,
  },
];

export const ALL_ACCOUNTS: QaAccount[] = [ADMIN, ...CUSTOMERS];

/** Tables that must always be scoped to the signed-in customer. */
export const CUSTOMER_SCOPED_TABLES = [
  "vehicles",
  "bid_requests",
  "quote_requests",
  "payments",
  "disputes",
] as const;
