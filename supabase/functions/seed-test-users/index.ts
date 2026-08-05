import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const USERS = [
  { email: "test.customer@gesodrides.test", password: "GesodTest!2026", name: "Test Customer", role: "customer" },
  { email: "test.admin@gesodrides.test", password: "GesodAdmin!2026", name: "Test Admin", role: "admin" },
];

Deno.serve(async () => {
  const results: unknown[] = [];

  for (const u of USERS) {
    let userId: string | null = null;

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name },
    });

    if (created?.user) {
      userId = created.user.id;
    } else {
      // Already exists: find and reset password + confirm
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = list?.users.find((x) => x.email === u.email);
      if (existing) {
        userId = existing.id;
        await admin.auth.admin.updateUserById(existing.id, {
          password: u.password,
          email_confirm: true,
        });
      }
    }

    if (!userId) {
      results.push({ email: u.email, ok: false, error: createError?.message ?? "could not create or find user" });
      continue;
    }

    await admin.from("users").upsert({ id: userId, email: u.email, name: u.name, role: u.role });
    await admin.from("user_roles").delete().eq("user_id", userId);
    await admin.from("user_roles").insert({ user_id: userId, role: u.role });

    results.push({ email: u.email, ok: true, role: u.role });
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
