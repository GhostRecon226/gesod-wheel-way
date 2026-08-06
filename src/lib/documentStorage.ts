import { supabase } from "@/integrations/supabase/client";

const BUCKET = "vehicle-documents";

/**
 * The vehicle-documents bucket is private and its storage policies require the
 * first folder of the object name to be the uploader's user id. Files are
 * therefore stored at `<userId>/<vehicleId>/<timestamp>_<filename>` and the
 * object path (not a public URL) is persisted in documents.file_url.
 */
export function buildDocumentPath(userId: string, vehicleId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  return `${userId}/${vehicleId}/${Date.now()}_${safeName}`;
}

export async function uploadVehicleDocument(userId: string, vehicleId: string, file: File) {
  const path = buildDocumentPath(userId, vehicleId, file.name);
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  return { path, error };
}

/**
 * Opens a stored document. Legacy rows may hold a full URL; newer rows hold a
 * storage object path which needs a short-lived signed URL because the bucket
 * is private.
 */
export async function openDocument(fileUrl: string): Promise<string | null> {
  if (/^https?:\/\//i.test(fileUrl)) {
    const marker = `/${BUCKET}/`;
    const idx = fileUrl.indexOf(marker);
    if (idx === -1) return fileUrl;
    fileUrl = decodeURIComponent(fileUrl.slice(idx + marker.length));
  }
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(fileUrl, 120);
  if (error || !data) return null;
  return data.signedUrl;
}
