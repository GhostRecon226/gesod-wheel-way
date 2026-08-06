# QA Regression Suite

Run this after every change. Both layers must be green before shipping.

```bash
npm run test        # data-access / RLS checks (Vitest, 48 assertions)
npm run test:e2e    # browser smoke tests (Playwright, 27 tests)
npm run test:all    # both, in order
```

## What is covered

### 1. Data access and permissions (`src/test/rlsAccess.test.ts`)
Signs in with real accounts and queries the backend directly.
- Admin can read every vehicle, milestone, bid, quote, payment, document and dispute.
- Each customer reads only their own rows; other customers' rows are invisible.
- Customers cannot grant themselves a role or write to admin-only tables.
- Anonymous visitors read only public auction listings and sailing schedules.

### 2. Browser smoke tests (`e2e/`)
- `public.spec.ts`: every public page renders with no console errors, branded 404 works, VIN tracker validation, quote flow reaches the ocean freight form.
- `dashboards.spec.ts`: admin and each customer sign in, land on the correct dashboard, every dashboard section renders without getting stuck on a loading spinner, customers are bounced off `/dashboard/admin`, customers never see another customer's name or email, logout returns to login and protected routes stay locked.

## Accounts

Test accounts and their expected landing routes live in `src/test/qaAccounts.ts`, shared by both suites. These are seeded QA accounts only, never production users.

## Notes

- Playwright is pinned to the version matching the installed browser build; run `npx playwright install chromium` on a fresh machine.
- The e2e suite expects the dev server on `http://localhost:8080`; `playwright.config.ts` starts it if it is not already running.
- When a section or label is renamed, update the `ADMIN_SECTIONS` / `CUSTOMER_SECTIONS` lists in `e2e/dashboards.spec.ts`.
