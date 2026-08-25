# Edge functions

Four functions live in `supabase/functions/`. They are plain Deno functions with no
Lovable-specific code, so they deploy unchanged to your own Supabase project.

| Function | Purpose | JWT verification | Secrets it needs |
|---|---|---|---|
| `admin-create-customer` | Admin-only creation of customer accounts; supports `mode: "password"` or `mode: "invite"` (`auth.admin.inviteUserByEmail`) | on | none beyond auto-injected `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `process-email-queue` | Drains the `auth_emails` / `transactional_emails` pgmq queues and sends via Resend; handles retries, DLQ, rate limits | on (`verify_jwt = true` in `supabase/config.toml`) — rejects non `service_role` callers | `RESEND_API_KEY` |
| `import-auction-listing` | Scrapes a Copart/IAAI listing URL (or pasted page text), extracts fields with an LLM, mirrors photos into `auction-images` | on | `FIRECRAWL_API_KEY`, `ANTHROPIC_API_KEY` |
| `auction-watch-notify` | Runs hourly; inserts notifications for watchlist rows whose auction opens today or has just closed | on | none beyond auto-injected |

Auto-injected by Supabase in every function: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`.

## Deploy

```sh
supabase link --project-ref <your-ref>
supabase functions deploy admin-create-customer
supabase functions deploy process-email-queue
supabase functions deploy import-auction-listing
supabase functions deploy auction-watch-notify
```

`supabase/config.toml` keeps `verify_jwt = true` for `process-email-queue`; deploy it
from the repo root so that config is picked up.

## Set secrets

```sh
supabase secrets set RESEND_API_KEY=...
supabase secrets set FIRECRAWL_API_KEY=...
supabase secrets set ANTHROPIC_API_KEY=...
```

Secrets are read at runtime, so no redeploy is needed after changing one.

## Note on AI provider

`import-auction-listing` calls an LLM for field extraction. On Lovable Cloud it can
use the gateway key `LOVABLE_API_KEY`; self-hosted, that key is not available, so set
`ANTHROPIC_API_KEY` (the function's own provider path) and confirm the model name in
`supabase/functions/import-auction-listing/index.ts` matches a model your Anthropic
account can call.

## Scheduled invocations to recreate

Neither schedule is in `schema.sql` (cron jobs are project state, not schema):

```sql
-- watchlist notifications, hourly
select cron.schedule(
  'auction-watch-notify', '0 * * * *',
  $$ select net.http_post(
       url := 'https://<your-ref>.supabase.co/functions/v1/auction-watch-notify',
       headers := jsonb_build_object(
         'Content-Type','application/json',
         'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'email_queue_service_role_key')),
       body := '{}'::jsonb) $$);
```

The email queue is self-arming: `public.email_queue_wake()` schedules a
`process-email-queue` cron job (every 5 seconds) when a message is enqueued and
`public.email_queue_dispatch()` unschedules it when both queues drain. Both functions
read a vault secret named `email_queue_service_role_key` and both hard-code the
project URL, so after migrating you must:

1. Store your own service-role key in vault under that exact name:
   `select vault.create_secret('<service_role_key>', 'email_queue_service_role_key');`
2. Update the `https://<ref>.supabase.co` URL inside `email_queue_dispatch()` and
   `email_queue_wake()` in `schema.sql` to your project ref before applying it.
3. Create the pgmq queues if they do not exist yet (they are created lazily by
   `public.enqueue_email`, or explicitly: `select pgmq.create('auth_emails');`
   `select pgmq.create('transactional_emails');` plus the `_dlq` variants).

Required extensions for the email pipeline: `pg_cron`, `pg_net`, `pgmq`, `supabase_vault`.
