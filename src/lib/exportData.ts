type Row = Record<string, unknown>;

const escapeCsv = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export const toCsv = (rows: Row[], columns?: string[]): string => {
  if (rows.length === 0) return "";
  const cols = columns ?? Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const header = cols.join(",");
  const body = rows.map((r) => cols.map((c) => escapeCsv(r[c])).join(",")).join("\n");
  return `${header}\n${body}`;
};

const download = (content: string, filename: string, mime: string) => {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const stamp = () => new Date().toISOString().slice(0, 10);

export const downloadCsv = (rows: Row[], name: string, columns?: string[]) =>
  download(toCsv(rows, columns), `${name}-${stamp()}.csv`, "text/csv");

export const downloadJson = (rows: Row[], name: string) =>
  download(JSON.stringify(rows, null, 2), `${name}-${stamp()}.json`, "application/json");
