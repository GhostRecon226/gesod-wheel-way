export interface DecodedVin {
  make: string | null;
  model: string | null;
  year: number | null;
}

/**
 * Best-effort VIN decode via NHTSA's free public vPIC API (no key required).
 * Returns null on any failure so callers fall back to manual entry silently —
 * this is a convenience auto-fill, not a required step.
 */
export async function decodeVin(vin: string): Promise<DecodedVin | null> {
  if (vin.length !== 17) return null;
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${encodeURIComponent(vin)}?format=json`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.Results?.[0];
    if (!result) return null;
    const year = result.ModelYear ? parseInt(result.ModelYear, 10) : NaN;
    return {
      make: result.Make || null,
      model: result.Model || null,
      year: Number.isFinite(year) ? year : null,
    };
  } catch {
    return null;
  }
}
