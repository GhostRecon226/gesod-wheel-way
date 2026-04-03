
## What is actually broken

Do I know what the issue is? Yes.

This is not an “email not found” problem.

The auth logs show two different failures for the same account:
1. `invalid_credentials` when `Pass=1234` was used
2. `email_not_confirmed` when `Pass=123` was used

That means:
- the account exists
- the account is still unconfirmed
- at least one login attempt also used the wrong password

There is also a backend provisioning problem: the database shows `handle_new_user()` exists, but the current backend metadata says there are no triggers installed. So new signups may still fail to create the matching `users` and `user_roles` records reliably.

## Plan

### 1. Repair the auth configuration that is still blocking login
- Re-enable temporary auto-confirm for email/password signups in Lovable Cloud while `notify.gesodrides.com` verification is still incomplete.
- For `chiwhite2001@yahoo.com`, confirm the existing account server-side or recreate it in a confirmed state if needed.
- Treat this as temporary until auth emails are fully deliverable.

### 2. Repair signup provisioning properly
- Create an idempotent migration that:
  - recreates `public.handle_new_user()`
  - drops and recreates the `on_auth_user_created` trigger on `auth.users`
  - backfills missing rows in `public.users`
  - backfills missing rows in `public.user_roles`
- This keeps profile and role creation on the backend, not in the client.

### 3. Add recovery paths for stuck users
- Add a “Forgot password?” action on `/login`.
- Create the required `/reset-password` route and password update form.
- Add a “Resend confirmation email” action when the auth error is `email_not_confirmed`.

### 4. Improve login error handling
- Replace raw provider errors with clear app messages:
  - `invalid_credentials` → “Incorrect email or password”
  - `email_not_confirmed` → “Your email address is not confirmed yet”
- For the unconfirmed case, surface the resend-confirmation option instead of only showing a toast.

### 5. Keep the current role-based routing, but validate it after the fix
- Leave the existing role lookup in `user_roles`.
- Verify successful login redirects:
  - customer → `/dashboard/customer`
  - admin → `/dashboard/admin`
- Verify unauthenticated users still get redirected to `/login`.

## Validation checklist
- Test signup for a brand-new user.
- Confirm that signup creates:
  - auth account
  - `users` row
  - `user_roles` row
- Test login for `chiwhite2001@yahoo.com` after confirmation/reset.
- Test wrong password handling.
- Test resend confirmation flow.
- Test password reset flow end-to-end.

## Technical notes
- The missing trigger is likely why signup provisioning is still unreliable.
- The logs confirm the current blocker for the existing account is email confirmation, with some attempts also using the wrong password.
- Generated backend client/type files should not be edited manually as part of this fix.
