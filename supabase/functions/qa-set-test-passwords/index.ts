// Temporary QA helper: sets a known password on the seeded test accounts so the
// automated regression suite can sign in. Deleted after use.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { emails, password } = await req.json();
  const results: Record<string, string> = {};

  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

  for (const email of emails as string[]) {
    const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!existing) {
      results[email] = "not_found";
      continue;
    }
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    results[email] = error ? `error: ${error.message}` : "updated";
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
