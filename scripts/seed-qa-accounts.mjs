#!/usr/bin/env node
// Creates the QA test accounts defined in src/test/qaAccounts.ts through
// Supabase's Admin API (proper password hashing, confirmed email, and the
// public.users/user_roles rows created via the handle_new_user trigger).
//
// Run this yourself with your own service_role key — never share that key
// with anyone, including an AI assistant. Find it in the Supabase Dashboard
// under Project Settings > API > service_role (the "reveal" one).
//
// Usage:
//   SUPABASE_URL=https://<project-ref>.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=<your service_role key> \
//   node scripts/seed-qa-accounts.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables first.");
  process.exit(1);
}

const QA_PASSWORD = process.env.QA_TEST_PASSWORD ?? "GesodQa!2026";

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Keep this list in sync with src/test/qaAccounts.ts.
const ACCOUNTS = [
  { email: "qa-admin@gesodrides.com", name: "QA Admin", role: "admin" },
  { email: "qa-customer1@gesodrides.com", name: "QA Customer 1", role: "customer" },
  { email: "qa-customer2@gesodrides.com", name: "QA Customer 2", role: "customer" },
];

const results = [];

for (const account of ACCOUNTS) {
  const { data, error } = await admin.auth.admin.createUser({
    email: account.email,
    password: QA_PASSWORD,
    email_confirm: true,
    user_metadata: { name: account.name },
  });

  if (error) {
    console.error(`FAILED to create ${account.email}: ${error.message}`);
    continue;
  }

  console.log(`Created ${account.email} (${data.user.id})`);
  results.push({ ...account, id: data.user.id });

  if (account.role === "admin") {
    const { error: roleError } = await admin
      .from("user_roles")
      .upsert({ user_id: data.user.id, role: "admin" }, { onConflict: "user_id,role" });
    if (roleError) console.error(`  Failed to grant admin role: ${roleError.message}`);

    const { error: profileError } = await admin.from("users").update({ role: "admin" }).eq("id", data.user.id);
    if (profileError) console.error(`  Failed to update public.users.role: ${profileError.message}`);
  }
}

console.log("\nDone. User IDs (for seeding related data):");
for (const r of results) console.log(`  ${r.email}: ${r.id}`);
