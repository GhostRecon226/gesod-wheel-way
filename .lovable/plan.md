# Self-hosting export pack

Goal: produce everything needed to stand this app up on your own Supabase project, plus straight answers on IDs, keys, and ownership.

## Answers to your four questions

1. **Project reference ID** — this project runs on Lovable Cloud, so the backend project ref is managed and not something I surface in chat. The value your app actually uses is already in your repo: `VITE_SUPABASE_PROJECT_ID` in `.env` (and `project_id` in `supabase/config.toml`). Read them there.
2. **Schema export** — the full schema already exists as tracked SQL in `supabase/migrations/` (14 files). What's missing is a single consolidated, ordered file plus notes on pieces migrations can't hold (storage buckets, auth settings, cron jobs). That's the deliverable below.
3. **URL and anon key** — also already in your repo: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env`. The publishable/anon key is safe client-side. Note: if you point the app at your own Supabase project, you replace all three values with your own.
4. **Ownership transfer** — a Lovable Cloud backend cannot be transferred into a personal Supabase account, and Cloud cannot be disconnected from this project. The supported path is recreate + migrate: create your own Supabase project, apply the migrations, import your data (Cloud → Advanced settings → Export data), redeploy the edge functions, then repoint `.env`.

## What I'll build

Create a `docs/self-host/` folder containing:

- **`schema.sql`** — one consolidated, ordered SQL file: enum types, tables, GRANTs, RLS enablement, all policies, functions, triggers. Assembled from the existing migrations so it applies cleanly to an empty Postgres/Supabase database.
- **`storage.md`** — bucket definitions (`vehicle-documents`, `auction-images`, both private) with the exact `storage.objects` policies to recreate, since buckets are created through the dashboard/API rather than SQL.
- **`edge-functions.md`** — the four functions in `supabase/functions/` (`admin-create-customer`, `process-email-queue`, `import-auction-listing`, `auction-watch-notify`), deploy commands, and the secret each one needs (`RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `FIRECRAWL_API_KEY`, plus auto-injected `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`).
- **`MIGRATION.md`** — step-by-step runbook: create project → apply schema → create buckets → deploy functions → set secrets → configure auth (email confirm, leaked-password protection, Google provider) → recreate the `pg_cron` schedules for the email queue and watchlist notifier → swap `.env` → verify with the existing Vitest RLS suite and Playwright smoke tests.
- **`data-export.md`** — how to get your rows out (Cloud → Advanced settings → Export data) and load them in, with the correct table insert order for foreign keys.

## Technical notes

- No application code changes; documentation and SQL only.
- `schema.sql` is derived from the live schema definition in the migrations, not a `pg_dump`, so it stays readable and reviewable.
- Vault-backed items (the service-role key stored for cron dispatch) can't be exported; the runbook documents recreating that secret in your own project.
- Auth users live in the `auth` schema and are not part of `schema.sql`; the data-export doc covers them separately.
