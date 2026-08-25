#!/usr/bin/env bash
# Verify that a given user has working admin access to /dashboard/admin.
#
# Usage: bash scripts/verify-admin-access.sh chibuzor_opara15@yahoo.com
#
# Checks, in order:
#   1. a profile row exists in public.users for the email
#   2. that profile row has role = 'admin'
#   3. an 'admin' row exists in public.user_roles (this is what RLS + the app read)
# The app resolves the role from public.user_roles and treats any user holding an
# 'admin' row as admin, so an extra 'customer' row is harmless.

set -euo pipefail

EMAIL="${1:-chibuzor_opara15@yahoo.com}"

q() { psql -tAX -c "$1"; }

USER_ID=$(q "select id from public.users where lower(email) = lower('${EMAIL}') limit 1;")
if [ -z "$USER_ID" ]; then
  echo "FAIL: no profile found for ${EMAIL}"
  exit 1
fi
echo "PASS: profile exists (${USER_ID})"

PROFILE_ROLE=$(q "select role from public.users where id = '${USER_ID}';")
[ "$PROFILE_ROLE" = "admin" ] && echo "PASS: public.users.role = admin" || echo "FAIL: public.users.role = '${PROFILE_ROLE:-<missing>}'"

HAS_ADMIN_ROW=$(q "select exists (select 1 from public.user_roles where user_id = '${USER_ID}' and role = 'admin');")
[ "$HAS_ADMIN_ROW" = "t" ] && echo "PASS: public.user_roles has an admin row" || echo "FAIL: no admin row in public.user_roles"

ALL_ROLES=$(q "select string_agg(role::text, ', ' order by role::text) from public.user_roles where user_id = '${USER_ID}';")
echo "INFO: roles held = ${ALL_ROLES:-none}"

if [ "$HAS_ADMIN_ROW" = "t" ] && [ "$PROFILE_ROLE" = "admin" ]; then
  echo
  echo "RESULT: ${EMAIL} should land on /dashboard/admin on next sign-in."
  exit 0
fi

echo
echo "RESULT: admin access NOT confirmed for ${EMAIL}."
exit 1
