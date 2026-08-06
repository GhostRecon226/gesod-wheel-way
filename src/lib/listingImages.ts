import { supabase } from "@/integrations/supabase/client";

export const LISTING_BUCKET = "auction-images";

const SIGNED_URL_TTL = 60 * 60; // 1 hour

/**
 * Listing photos live in the private `auction-images` bucket. Anyone (including
 * anonymous visitors) may read from it, but reads still need a short-lived
 * signed URL because the workspace does not allow public buckets.
 */
export function buildListingImagePath(fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  return `listings/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;
}

export async function uploadListingImage(file: File) {
  const path = buildListingImagePath(file.name);
  const { error } = await supabase.storage.from(LISTING_BUCKET).upload(path, file, {
    contentType: file.type || undefined,
  });
  return { path, error };
}

export async function removeListingImage(path: string) {
  if (/^https?:\/\//i.test(path)) return;
  await supabase.storage.from(LISTING_BUCKET).remove([path]);
}

/**
 * Turns stored image references into displayable URLs. Legacy rows may hold a
 * full URL; newer rows hold an object path inside `auction-images`.
 */
export async function resolveListingImages(refs: string[] | null): Promise<string[]> {
  if (!refs || refs.length === 0) return [];

  const paths = refs.filter((r) => !/^https?:\/\//i.test(r));
  const signedMap = new Map<string, string>();

  if (paths.length > 0) {
    const { data } = await supabase.storage
      .from(LISTING_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL);
    (data ?? []).forEach((entry) => {
      if (entry.signedUrl && entry.path) signedMap.set(entry.path, entry.signedUrl);
    });
  }

  return refs
    .map((ref) => (/^https?:\/\//i.test(ref) ? ref : signedMap.get(ref) ?? null))
    .filter((url): url is string => Boolean(url));
}
