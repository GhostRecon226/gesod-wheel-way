import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const BodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional(),
  mode: z.enum(["password", "invite"]).default("password"),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Random temporary password the admin can hand to the customer at account
// creation time. Meets Supabase Auth's default minimum length.
function generateTemporaryPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 16) + "!1";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Not authenticated" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Not authenticated" }, 401);

    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (roleErr || !isAdmin) return json({ error: "Admins only" }, 403);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return json({ error: parsed.error.errors[0]?.message ?? "Invalid request" }, 400);
    }
    const { name, email, phone, mode } = parsed.data;
    const metadata = { name, phone: phone ?? null, role: "customer" };

    // Creating (or inviting) the auth user fires the on_auth_user_created
    // trigger, which inserts the matching public.users row (name from
    // user_metadata) and grants the default 'customer' role via user_roles —
    // see handle_new_user(). The trigger only reads `name` today; phone is
    // set below via a follow-up update since public.users has no metadata sync.
    let userId: string;
    let temporaryPassword: string | null = null;

    if (mode === "invite") {
      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
        data: metadata,
      });
      if (inviteErr || !invited?.user) {
        return json({ error: inviteErr?.message ?? "Could not send the invite." }, 400);
      }
      userId = invited.user.id;
    } else {
      temporaryPassword = generateTemporaryPassword();
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (createErr || !created?.user) {
        return json({ error: createErr?.message ?? "Could not create the customer account." }, 400);
      }
      userId = created.user.id;
    }

    if (phone) {
      const { error: phoneErr } = await admin
        .from("users")
        .update({ phone })
        .eq("id", userId);
      if (phoneErr) {
        console.error("Failed to set phone on new customer", phoneErr.message);
      }
    }

    return json({
      id: userId,
      name,
      email,
      phone: phone ?? null,
      mode,
      temporaryPassword,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Customer creation failed";
    console.error("admin-create-customer error:", message);
    return json({ error: message }, 500);
  }
});
