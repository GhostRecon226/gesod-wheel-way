import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const BUCKET = "auction-images";
const MAX_IMAGES = 12;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const BodySchema = z
  .object({
    url: z.string().trim().max(2000).optional(),
    pastedText: z.string().trim().max(120000).optional(),
    imageUrls: z.array(z.string().trim().max(2000)).max(30).optional(),
  })
  .refine((b) => Boolean(b.url || b.pastedText), {
    message: "Provide an auction URL or pasted page text",
  });

const FIELD_KEYS = [
  "make",
  "model",
  "year",
  "vin",
  "lot_number",
  "auction_source",
  "auction_date",
  "yard_location",
  "title_type",
  "odometer",
  "primary_damage",
  "secondary_damage",
  "damage_description",
  "run_and_drive",
  "has_keys",
  "estimated_value",
  "body_style",
  "engine",
  "transmission",
  "drivetrain",
  "fuel_type",
  "exterior_color",
  "interior_color",
] as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isSupportedAuctionUrl(raw: string) {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    return (
      host === "copart.com" ||
      host.endsWith(".copart.com") ||
      host === "iaai.com" ||
      host.endsWith(".iaai.com")
    );
  } catch {
    return false;
  }
}

function sourceFromUrl(raw: string) {
  const host = raw.toLowerCase();
  if (host.includes("copart")) return "Copart";
  if (host.includes("iaai")) return "IAAI";
  return null;
}

async function scrapeWithFirecrawl(url: string) {
  if (!FIRECRAWL_API_KEY) {
    throw new Error("Auction link import is not configured (missing Firecrawl credentials).");
  }
  const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown", "links", "rawHtml"],
      onlyMainContent: false,
      waitFor: 4000,
    }),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const detail =
      (payload && (payload.error || payload.message)) || `status ${res.status}`;
    throw new Error(`Could not read the auction page: ${detail}`);
  }

  const data = payload?.data ?? payload ?? {};
  const markdown: string = data.markdown ?? "";
  const rawHtml: string = data.rawHtml ?? "";
  const links: string[] = Array.isArray(data.links) ? data.links : [];
  return { markdown, rawHtml, links };
}

function collectImageUrls(sources: {
  rawHtml?: string;
  links?: string[];
  extra?: string[];
}) {
  const found = new Set<string>();
  const push = (u: string) => {
    const clean = u.replace(/&amp;/g, "&").trim();
    if (!/^https?:\/\//i.test(clean)) return;
    if (!/\.(jpe?g|png|webp)(\?|$)/i.test(clean)) return;
    if (/(sprite|logo|icon|placeholder|favicon)/i.test(clean)) return;
    found.add(clean);
  };

  (sources.extra ?? []).forEach((u) => {
    const clean = u.replace(/&amp;/g, "&").trim();
    if (/^https?:\/\//i.test(clean)) found.add(clean);
  });
  (sources.links ?? []).forEach(push);

  if (sources.rawHtml) {
    const re = /https?:\/\/[^"'\s<>\\]+\.(?:jpe?g|png|webp)(?:\?[^"'\s<>\\]*)?/gi;
    for (const match of sources.rawHtml.matchAll(re)) push(match[0]);
  }

  return Array.from(found).slice(0, MAX_IMAGES);
}

async function extractFields(pageText: string, sourceHint: string | null) {
  if (!LOVABLE_API_KEY) throw new Error("AI extraction is not configured.");

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      make: { type: ["string", "null"] },
      model: { type: ["string", "null"] },
      year: { type: ["integer", "null"] },
      vin: { type: ["string", "null"] },
      lot_number: { type: ["string", "null"] },
      auction_source: { type: ["string", "null"] },
      auction_date: { type: ["string", "null"] },
      yard_location: { type: ["string", "null"] },
      title_type: { type: ["string", "null"] },
      odometer: { type: ["integer", "null"] },
      primary_damage: { type: ["string", "null"] },
      secondary_damage: { type: ["string", "null"] },
      damage_description: { type: ["string", "null"] },
      run_and_drive: { type: ["boolean", "null"] },
      has_keys: { type: ["boolean", "null"] },
      estimated_value: { type: ["number", "null"] },
      body_style: { type: ["string", "null"] },
      engine: { type: ["string", "null"] },
      transmission: { type: ["string", "null"] },
      drivetrain: { type: ["string", "null"] },
      fuel_type: { type: ["string", "null"] },
      exterior_color: { type: ["string", "null"] },
      interior_color: { type: ["string", "null"] },
    },
    required: [...FIELD_KEYS],
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Lovable-API-Key": LOVABLE_API_KEY,
      "Content-Type": "application/json",
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-3.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You extract salvage-auction vehicle listing data from Copart or IAAI page text. " +
            "Return json only. Use null for anything not clearly stated - never guess. " +
            "auction_date must be YYYY-MM-DD. odometer in miles as an integer. " +
            "estimated_value is the estimated retail value in USD as a plain number. " +
            "title_type should be one of Clean, Salvage, Rebuilt, Certificate of Destruction when it maps cleanly.",
        },
        {
          role: "user",
          content:
            (sourceHint ? `Auction source: ${sourceHint}\n\n` : "") +
            `Page content:\n${pageText.slice(0, 60000)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "auction_listing", strict: true, schema },
      },
    }),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = payload?.error?.message ?? `status ${res.status}`;
    throw new Error(`Could not extract vehicle details: ${detail}`);
  }

  const content = payload?.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    throw new Error("Could not extract vehicle details from this page.");
  }
}

async function storeImages(admin: ReturnType<typeof createClient>, urls: string[]) {
  const stored: string[] = [];
  const failed: string[] = [];

  for (const url of urls.slice(0, MAX_IMAGES)) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) {
        failed.push(url);
        continue;
      }
      const type = res.headers.get("content-type") ?? "";
      if (!type.startsWith("image/")) {
        failed.push(url);
        continue;
      }
      const buf = new Uint8Array(await res.arrayBuffer());
      if (buf.byteLength === 0 || buf.byteLength > MAX_IMAGE_BYTES) {
        failed.push(url);
        continue;
      }
      const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
      const path = `listings/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_import.${ext}`;
      const { error } = await admin.storage.from(BUCKET).upload(path, buf, {
        contentType: type,
        upsert: false,
      });
      if (error) {
        failed.push(url);
        continue;
      }
      stored.push(path);
    } catch {
      failed.push(url);
    }
  }

  return { stored, failed };
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
    const { url, pastedText, imageUrls } = parsed.data;

    let pageText = pastedText ?? "";
    let candidateImages: string[] = [];
    let sourceHint: string | null = null;

    if (url) {
      if (!isSupportedAuctionUrl(url)) {
        return json({ error: "Only Copart or IAAI vehicle links are supported." }, 400);
      }
      sourceHint = sourceFromUrl(url);
      const scraped = await scrapeWithFirecrawl(url);
      if (!scraped.markdown && !scraped.rawHtml) {
        return json(
          {
            error:
              "The auction page could not be read (it is likely blocking automated access). Paste the page details instead.",
            fallback: "paste",
          },
          422,
        );
      }
      pageText = scraped.markdown || scraped.rawHtml;
      candidateImages = collectImageUrls({
        rawHtml: scraped.rawHtml,
        links: scraped.links,
        extra: imageUrls,
      });
    } else {
      candidateImages = collectImageUrls({ rawHtml: pageText, extra: imageUrls });
      if (/copart/i.test(pageText)) sourceHint = "Copart";
      else if (/iaai/i.test(pageText)) sourceHint = "IAAI";
    }

    if (pageText.trim().length < 40) {
      return json(
        { error: "Not enough page content to extract details.", fallback: "manual" },
        422,
      );
    }

    const fields = await extractFields(pageText, sourceHint);
    if (!fields.auction_source && sourceHint) fields.auction_source = sourceHint;

    const { stored, failed } = await storeImages(admin, candidateImages);

    const missing = FIELD_KEYS.filter((k) => {
      const v = fields[k];
      return v === null || v === undefined || v === "";
    });

    return json({
      fields,
      images: stored,
      imagesFailed: failed.length,
      missing,
      sourceUrl: url ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    console.error("import-auction-listing error:", message);
    return json({ error: message, fallback: "paste" }, 500);
  }
});
