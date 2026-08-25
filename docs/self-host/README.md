# Self-hosting export pack

Everything needed to run GESOD RIDES on a Supabase project you own.

| File | What it covers |
|---|---|
| `MIGRATION.md` | Step-by-step runbook, start here |
| `schema.sql` | Consolidated schema: types, tables, indexes, GRANTs, RLS, policies, functions, triggers, storage policies |
| `storage.md` | The two storage buckets, their access rules, and copying objects |
| `edge-functions.md` | The four edge functions, their secrets, and the cron schedules to recreate |
| `data-export.md` | Getting rows and auth users out and loading them in FK order |

`schema.sql` is generated from the live database catalog, so it reflects the current
state rather than replaying the 14 files in `supabase/migrations/`. Those migration
files remain the source of truth for incremental changes; use `schema.sql` only to
bootstrap a fresh database.
