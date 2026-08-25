# Self-hosting runbook

Move this app off Lovable Cloud onto a Supabase project you own. Nothing in the app
code is Lovable-specific; the only coupling is the three `VITE_SUPABASE_*` values.

## 0. What cannot be transferred

A Lovable Cloud backend cannot be handed over to a personal Supabase account, and
Cloud cannot be detached from this project. The path is recreate + migrate: new
project, apply schema, import data, redeploy functions, repoint env. Your current
project ref / URL / anon key are already in your repo (`.env`,
`supabase/config.toml`) if you need them to read from the old database.

Also not exportable: the old project's service-role key and database password.

## 1. Create the new Supabase project

Create the project, then enable the extensions the schema needs:

```sql
create extension if not exists pgcrypto;
create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists pgmq;
-- supabase_vault is enabled by default on Supabase
```

## 2. Apply the schema

Edit `schema.sql` first: the two email-queue functions hard-code the old project URL
(`https://<old-ref>.supabase.co/functions/v1/process-email-queue`) — replace with your
own ref. Then:

```sh
psql "$NEW_DATABASE_URL" -f docs/self-host/schema.sql
```

This creates enum types, 25 tables, indexes, GRANTs for `anon` / `authenticated` /
`service_role`, RLS on every table, 66 public policies, 10 functions, the
`updated_at` and `on_auth_user_created` triggers, and the 8 `storage.objects`
policies (which need the buckets to exist first, so either create buckets before
running this or run the storage section afterwards).

## 3. Create the storage buckets

See `storage.md`. Both are private.

## 4. Deploy edge functions and set secrets

See `edge-functions.md`. Secrets to set: `RESEND_API_KEY`, `FIRECRAWL_API_KEY`,
`ANTHROPIC_API_KEY`.

## 5. Configure auth

Match the current settings:

- Email/password enabled; **email confirmation required** (no auto-confirm).
- Anonymous sign-ins disabled.
- Leaked password protection **on** (Auth → Policies).
- Google provider enabled with your own OAuth client; redirect URL
  `https://<your-domain>/` (same-origin; the app reads `window.location.origin`).
- Site URL and additional redirect URLs set to your production domain plus
  `http://localhost:8080` for local dev.
- Password reset flow uses `/reset-password`, so add it to redirect URLs.

If you use Resend for auth emails as today, point the auth email hook at your queue
setup or configure Supabase SMTP with Resend credentials.

## 6. Recreate the cron schedules and vault secret

See the "Scheduled invocations" section of `edge-functions.md`:
`email_queue_service_role_key` in vault, plus the hourly `auction-watch-notify` job.

## 7. Import data

See `data-export.md` (auth users first, then public tables in FK order, then storage
objects).

## 8. Repoint the app

Replace in `.env` (and in your host's env vars):

```
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your anon/publishable key>
VITE_SUPABASE_PROJECT_ID=<your-ref>
```

Also set `project_id` in `supabase/config.toml` to your ref.

`src/integrations/supabase/client.ts` uses `brokeredPreviewStorage()` from
`src/integrations/supabase/previewAuthStorage.ts`, a Lovable preview shim. It falls
back to normal `localStorage` outside the Lovable preview, so it is safe to keep; if
you want it gone, replace the `storage` option with `window.localStorage`.

`src/integrations/supabase/types.ts` is generated. Regenerate against your project:

```sh
supabase gen types typescript --project-id <your-ref> > src/integrations/supabase/types.ts
```

## 9. Build and host

```sh
npm ci
npm run build      # outputs dist/
```

`dist/` is a static SPA — any static host works (Vercel, Netlify, Cloudflare Pages,
S3+CloudFront, nginx). Configure a SPA fallback rewrite of all paths to `/index.html`,
otherwise deep links like `/dashboard/admin` 404.

## 10. Verify

```sh
npm run test       # Vitest data-access / RLS suite (customers see only own data)
npm run test:e2e   # Playwright smoke tests across public pages and both dashboards
```

Both suites read the seeded QA accounts in `src/test/qaAccounts.ts` — recreate those
users in the new project (or update the file) before running them. See
`docs/QA_REGRESSION.md`.

Manual spot checks: sign in as admin and as customer, load `/track` with a known VIN
(exercises the `track_vehicle_by_vin` RPC as anon), open a listing detail page (signed
URLs from `auction-images`), upload a document (private bucket policy), and submit a
quote request.
