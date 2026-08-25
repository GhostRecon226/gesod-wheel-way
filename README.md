# GESOD RIDES

GESOD RIDES is a vehicle import and logistics platform. It coordinates the
full pipeline for customers importing vehicles from U.S. auctions into
Nigeria: browsing and bidding on auction listings, tracking a vehicle through
customs and shipping milestones, managing quotes and payments, and handling
disputes and documents — with separate customer and admin dashboards.

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Vitest (data-access tests) + Playwright (browser smoke tests)

## Running locally

You need Node.js and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone <this-repository-url>
cd gesod-wheel-way
npm i
npm run dev
```

The app runs at `http://localhost:8080`.

Other scripts:

```sh
npm run build      # production build
npm run lint        # eslint
npm run test        # vitest (data-access / RLS suite)
npm run test:e2e     # playwright (browser smoke tests)
npm run test:all     # both test suites
```

See [docs/QA_REGRESSION.md](docs/QA_REGRESSION.md) for what the test suites
cover and the seeded QA accounts they run against.

## Environment variables

Copy these into a `.env` file at the project root (not committed — see
`.gitignore`):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon/public key>
VITE_SUPABASE_PROJECT_ID=<project-ref>
```

These come from your Supabase project's API settings. The publishable key is
the anon key — safe to expose client-side, RLS policies handle authorization.

## Supabase setup

The backend project lives under Supabase project ref `ljdhkixhcalrlpjacakf`.
To point the Supabase CLI at it:

```sh
npx supabase login --token <your-personal-access-token>
npx supabase link --project-ref ljdhkixhcalrlpjacakf
```

**Schema**: all tables, RLS policies, and functions are tracked as SQL
migrations under `supabase/migrations/`. Apply them with:

```sh
npx supabase db push
```

**Edge functions**: under `supabase/functions/`, deployed with:

```sh
npx supabase functions deploy <function-name>
```

Each function needs its own secrets set via `npx supabase secrets set` (or
the Supabase dashboard's Project Settings → Secrets):

| Function | Required secrets |
|---|---|
| `process-email-queue` | `RESEND_API_KEY` |
| `import-auction-listing` | `ANTHROPIC_API_KEY`, `FIRECRAWL_API_KEY` |
| `admin-create-customer` | none beyond the standard `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (auto-injected) |
| `auction-watch-notify` | none beyond the standard auto-injected secrets |

**Storage**: two buckets — `vehicle-documents` (private, owner/admin-scoped)
and `auction-images` (public read, admin-only write).
