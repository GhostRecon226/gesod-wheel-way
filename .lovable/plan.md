

## Diagnosis

Two issues are blocking login:

1. **Email not confirmed** — Email verification is required, but the confirmation email may not have arrived (DNS for `notify.gesodrides.com` is still pending). The actual backend error is `email_not_confirmed`, not "email not found."

2. **Profile creation fails silently** — During signup, the client tries to INSERT into the `users` table, but the user has no authenticated session yet (email unconfirmed), so RLS rejects it with a 401. This means even after confirming email, the user would have no profile row.

## Plan

### Step 1: Fix profile creation with a database trigger

Replace the client-side `users` INSERT with a server-side trigger that fires on `auth.users` insert. This runs as `SECURITY DEFINER` and bypasses RLS.

**Migration:**
- Create function `handle_new_user()` that inserts into `public.users` using `NEW.id`, `NEW.email`, and `NEW.raw_user_meta_data->>'name'`
- Also insert into `public.user_roles` with role `'customer'`
- Create trigger `on_auth_user_created` on `auth.users` AFTER INSERT

**Update `Signup.tsx`:**
- Pass `name` in `options.data` of `signUp()` so it's available in `raw_user_meta_data`
- Remove the manual `supabase.from("users").insert(...)` call

### Step 2: Enable auto-confirm for email signups (temporary)

Since the email domain DNS is still verifying, users can't receive confirmation emails. Enable auto-confirm so signups work immediately. This can be disabled later once email delivery is active.

Use `cloud--configure_auth` to enable auto-confirm.

### Step 3: Fix existing user

The user `chiwhite2001@yahoo.com` already exists in `auth.users` but has no `public.users` row. The trigger will only apply to new signups. Run a migration to backfill:
- Insert into `public.users` for any `auth.users` rows missing a profile
- Insert into `public.user_roles` for those users

### Step 4: Update AuthContext and Login

- `AuthContext.tsx`: Query `user_roles` table instead of `users.role` for role detection (aligns with proper role architecture)
- `Login.tsx`: Same — use `user_roles` for redirect logic
- Remove all references to `users.role` column for access control decisions

### Files changed
- **New migration** — trigger + backfill
- `src/pages/Signup.tsx` — remove manual insert, pass name in metadata
- `src/contexts/AuthContext.tsx` — fetch role from `user_roles`
- `src/pages/Login.tsx` — fetch role from `user_roles`

