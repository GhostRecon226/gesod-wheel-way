/** Masks a VIN to its first four and last four characters. */
export function maskVin(vin: string) {
  if (vin.length <= 8) return vin;
  return vin.slice(0, 4) + "*".repeat(vin.length - 8) + vin.slice(-4);
}
