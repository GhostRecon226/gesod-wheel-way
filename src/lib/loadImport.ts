import * as XLSX from "xlsx";

export interface ImportField {
  key: string;
  label: string;
  required?: boolean;
  aliases: string[];
}

export const IMPORT_FIELDS: ImportField[] = [
  { key: "load_id", label: "Load ID", aliases: ["load id", "load#", "load number"] },
  { key: "customer_name", label: "Customer Name", aliases: ["customer", "customer name"] },
  { key: "transporter_name", label: "Transporter Name", aliases: ["transporter", "transporter name", "driver", "driver name"] },
  { key: "make", label: "Make", aliases: ["make"] },
  { key: "model", label: "Model", aliases: ["model"] },
  { key: "year", label: "Year", aliases: ["year"] },
  { key: "vin", label: "VIN", required: true, aliases: ["vin", "vin number"] },
  { key: "origin", label: "Origin", aliases: ["origin", "pickup location", "pickup"] },
  { key: "destination", label: "Destination", aliases: ["destination", "destination address"] },
  { key: "pickup_cost", label: "Pickup Cost", aliases: ["pickup cost", "pickup price"] },
  { key: "additional_charges", label: "Additional Charges", aliases: ["additional charges", "extra charges", "additional fees"] },
];

export interface ParsedSheet {
  headers: string[];
  rows: string[][];
}

// Reads the first sheet of a .xlsx, .xls, or .csv file into a plain header
// row + string-cell grid. SheetJS auto-detects the format from the buffer,
// so one code path covers all three accepted file types.
export const parseSpreadsheetFile = async (file: File): Promise<ParsedSheet> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { headers: [], rows: [] };
  const sheet = workbook.Sheets[sheetName];
  const grid: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
  if (grid.length === 0) return { headers: [], rows: [] };

  const headers = grid[0].map((h) => String(h ?? "").trim());
  const rows = grid
    .slice(1)
    .filter((r) => r.some((c) => String(c ?? "").trim() !== ""))
    .map((r) => headers.map((_, i) => String(r[i] ?? "").trim()));

  return { headers, rows };
};

export type FieldMapping = Record<string, number | null>;

// Pre-fills a header -> field mapping wherever a column header matches a
// field's label or one of its aliases exactly (case-insensitive).
export const autoMapHeaders = (headers: string[]): FieldMapping => {
  const mapping: FieldMapping = {};
  for (const field of IMPORT_FIELDS) {
    const candidates = [field.label.toLowerCase(), ...field.aliases];
    const idx = headers.findIndex((h) => candidates.includes(h.trim().toLowerCase()));
    mapping[field.key] = idx >= 0 ? idx : null;
  }
  return mapping;
};

export type MappedValues = Record<string, string>;

export const applyMapping = (row: string[], mapping: FieldMapping): MappedValues => {
  const values: MappedValues = {};
  for (const field of IMPORT_FIELDS) {
    const idx = mapping[field.key];
    values[field.key] = idx != null ? (row[idx] ?? "").trim() : "";
  }
  return values;
};

export interface ReviewRow {
  rowIndex: number;
  values: MappedValues;
  valid: boolean;
  included: boolean;
}

export const buildReviewRows = (rows: string[][], mapping: FieldMapping): ReviewRow[] =>
  rows.map((row, rowIndex) => {
    const values = applyMapping(row, mapping);
    const valid = values.vin.length > 0;
    return { rowIndex, values, valid, included: valid };
  });

interface LoadInsertPayload {
  vin: string;
  lot_number: string | null;
  customer_id: string | null;
  driver_id: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  pickup_location: string | null;
  destination_address: string | null;
  agreed_pickup_price: number | null;
  service_fee?: number;
  notes: string | null;
}

const parseNumber = (s: string): number | null => {
  const n = parseFloat(s.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

// Resolves a row's Customer Name / Transporter Name text against existing
// users/drivers (case-insensitive exact match) and builds the insert payload.
// Unmatched customer/transporter names are preserved in notes rather than
// silently dropped, so the admin can link them manually later.
export const resolveRowPayload = (
  row: ReviewRow,
  customerIdByName: Map<string, string>,
  driverIdByName: Map<string, string>
): LoadInsertPayload => {
  const v = row.values;
  const customerId = v.customer_name ? customerIdByName.get(v.customer_name.toLowerCase()) ?? null : null;
  const driverId = v.transporter_name ? driverIdByName.get(v.transporter_name.toLowerCase()) ?? null : null;

  const noteParts: string[] = [];
  if (v.customer_name && !customerId) noteParts.push(`Imported customer: ${v.customer_name}`);
  if (v.transporter_name && !driverId) noteParts.push(`Imported transporter (unmatched): ${v.transporter_name}`);

  const year = v.year ? parseInt(v.year, 10) : null;
  const additionalCharges = v.additional_charges ? parseNumber(v.additional_charges) : null;

  return {
    vin: v.vin.toUpperCase(),
    lot_number: v.load_id || null,
    customer_id: customerId,
    driver_id: driverId,
    make: v.make || null,
    model: v.model || null,
    year: year && Number.isFinite(year) ? year : null,
    pickup_location: v.origin || null,
    destination_address: v.destination || null,
    agreed_pickup_price: v.pickup_cost ? parseNumber(v.pickup_cost) : null,
    ...(additionalCharges != null ? { service_fee: additionalCharges } : {}),
    notes: noteParts.length ? noteParts.join("\n") : null,
  };
};
