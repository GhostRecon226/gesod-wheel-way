# QA Regression Suite

Run this after every change. Both layers must be green before shipping.

```bash
npm run test        # data-access / RLS checks (Vitest, 70 assertions)
npm run test:e2e    # browser smoke tests (Playwright, 28 tests)
npm run test:all    # both, in order
```

## What is covered

### 1. Data access and permissions (`src/test/rlsAccess.test.ts`)
Signs in with real accounts and queries the backend directly.
- Admin can read every vehicle, milestone, bid, quote, payment, document and dispute.
- Each customer reads only their own rows; other customers' rows are invisible.
- Customers cannot grant themselves a role or write to admin-only tables.
- Anonymous visitors read only public auction listings and sailing schedules.
- **Loads/Drivers ERP** (`loads`, `drivers`, `driver_payments`, `load_status_history`,
  `invoices`, `invoice_loads`, `invoice_line_items`): admin has full access to all
  seven tables; a customer can read (but not write) their own `loads`/`invoices`
  and, through the owning load/invoice, their own `load_status_history`/
  `invoice_line_items`; `drivers`, `driver_payments`, and `invoice_loads` are
  invisible to customers entirely; anonymous visitors read none of the seven.
  Unlike every other table above, nothing seeds these — the suite creates one
  fixture row per table in `beforeAll` and deletes all of them in `afterAll`,
  so a run leaves the database exactly as it found it.

### 2. Browser smoke tests (`e2e/`)
- `public.spec.ts`: every public page renders with no console errors, branded 404 works, VIN tracker validation, quote flow reaches the ocean freight form.
- `dashboards.spec.ts`: admin and each customer sign in, land on the correct dashboard, every dashboard section renders without getting stuck on a loading spinner, customers are bounced off `/dashboard/admin`, customers never see another customer's name or email, logout returns to login and protected routes stay locked. Also checks that Loads and Drivers — the only two admin sections with real URLs rather than in-page tab state — are reachable both via the sidebar and by navigating to their URL directly.

## Accounts

Test accounts and their expected landing routes live in `src/test/qaAccounts.ts`, shared by both suites. These are seeded QA accounts only, never production users.

## Notes

- Playwright is pinned to the version matching the installed browser build; run `npx playwright install chromium` on a fresh machine.
- The e2e suite expects the dev server on `http://localhost:8080`; `playwright.config.ts` starts it if it is not already running.
- When a section or label is renamed, update the `ADMIN_SECTIONS` / `CUSTOMER_SECTIONS` lists in `e2e/dashboards.spec.ts`.
- Loads and Drivers are the only admin sections with real routes (`/dashboard/admin/loads[/:id]`, `/dashboard/admin/drivers[/:id]`, `/dashboard/admin/driver-payments`) — every other section is in-page tab state with no URL of its own. The generic `ADMIN_SECTIONS` loop still covers them (clicking the sidebar button still shows the right heading), but if you add another routed section, also extend the "real, bookmarkable URLs" test rather than assuming the generic loop is enough.
