import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

function parseJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = parts[1]
      .replaceAll("-", "+")
      .replaceAll("_", "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

    return JSON.parse(atob(payload)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Sends watchlist alerts:
 *  - "bidding opens today" when a watched listing reaches its auction date
 *  - "bidding closed" once the auction date has passed
 * Each alert is sent once per watchlist entry.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Defense in depth: verify_jwt=true already requires a valid JWT at the
    // gateway layer. This adds an explicit role check so only service-role
    // callers (e.g. the pg_cron job) can trigger watchlist notifications.
    const token = authHeader.slice("Bearer ".length).trim();
    const claims = parseJwtClaims(token);
    if (claims?.role !== "service_role") {
      return json({ error: "Forbidden" }, 403);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const today = new Date().toISOString().slice(0, 10);

    const { data: rows, error } = await supabase
      .from("auction_watchlist")
      .select(
        "id, user_id, notified_start_at, notified_end_at, auction_listings(id, make, model, year, lot_number, auction_date)",
      );

    if (error) {
      console.error("watchlist read failed:", error.message);
      return json({ error: error.message }, 500);
    }

    const notifications: { user_id: string; message: string }[] = [];
    const startIds: string[] = [];
    const endIds: string[] = [];

    for (const row of rows ?? []) {
      const listing = (row as any).auction_listings;
      if (!listing?.auction_date) continue;

      const title =
        [listing.year, listing.make, listing.model].filter(Boolean).join(" ") || "A watched vehicle";
      const lot = listing.lot_number ? ` (Lot ${listing.lot_number})` : "";

      if (listing.auction_date === today && !row.notified_start_at) {
        notifications.push({
          user_id: row.user_id,
          message: `Bidding opens today on ${title}${lot}. Submit your bid request now if you still want this vehicle.`,
        });
        startIds.push(row.id);
      } else if (listing.auction_date < today && !row.notified_end_at) {
        notifications.push({
          user_id: row.user_id,
          message: `Bidding has closed on ${title}${lot}. The listing has moved to the auction archive.`,
        });
        endIds.push(row.id);
      }
    }

    if (notifications.length > 0) {
      const { error: insertError } = await supabase.from("notifications").insert(notifications);
      if (insertError) {
        console.error("notification insert failed:", insertError.message);
        return json({ error: insertError.message }, 500);
      }
    }

    const now = new Date().toISOString();
    if (startIds.length > 0) {
      await supabase
        .from("auction_watchlist")
        .update({ notified_start_at: now })
        .in("id", startIds);
    }
    if (endIds.length > 0) {
      await supabase.from("auction_watchlist").update({ notified_end_at: now }).in("id", endIds);
    }

    return json({ sent: notifications.length, opened: startIds.length, closed: endIds.length });
  } catch (e) {
    console.error("auction-watch-notify failed:", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
