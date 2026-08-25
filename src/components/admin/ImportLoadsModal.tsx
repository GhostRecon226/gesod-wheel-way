import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";
import { UploadCloud, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IMPORT_FIELDS,
  parseSpreadsheetFile,
  autoMapHeaders,
  buildReviewRows,
  resolveRowPayload,
  type ParsedSheet,
  type FieldMapping,
  type ReviewRow,
} from "@/lib/loadImport";

interface Option { id: string; name: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
  customers: Option[];
  drivers: Option[];
}

type Step = "upload" | "mapping" | "review" | "results";

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

const ImportLoadsModal = ({ open, onClose, onImported, customers, drivers }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<FieldMapping>({});
  const [reviewRows, setReviewRows] = useState<ReviewRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ created: number; skipped: number; total: number } | null>(null);

  const reset = () => {
    setStep("upload");
    setDragOver(false);
    setFileName("");
    setParsing(false);
    setParsed(null);
    setMapping({});
    setReviewRows([]);
    setImporting(false);
    setResults(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      toast({ title: "Unsupported file", description: "Please upload a .xlsx, .xls, or .csv file.", variant: "destructive" });
      return;
    }
    setFileName(file.name);
    setParsing(true);
    try {
      const sheet = await parseSpreadsheetFile(file);
      if (sheet.headers.length === 0 || sheet.rows.length === 0) {
        toast({ title: "Empty file", description: "No data rows were found in this file.", variant: "destructive" });
        setParsing(false);
        return;
      }
      setParsed(sheet);
      setMapping(autoMapHeaders(sheet.headers));
      setStep("mapping");
    } catch {
      toast({ title: "Could not read file", description: "The file may be corrupted or in an unsupported format.", variant: "destructive" });
    }
    setParsing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const setFieldMapping = (key: string, headerIndex: string) => {
    setMapping((prev) => ({ ...prev, [key]: headerIndex === "" ? null : parseInt(headerIndex, 10) }));
  };

  const vinMapped = mapping.vin != null;

  const goToReview = () => {
    if (!parsed) return;
    setReviewRows(buildReviewRows(parsed.rows, mapping));
    setStep("review");
  };

  const toggleRow = (rowIndex: number) => {
    setReviewRows((prev) => prev.map((r) => (r.rowIndex === rowIndex ? { ...r, included: !r.included } : r)));
  };

  const readyCount = reviewRows.filter((r) => r.valid).length;
  const errorCount = reviewRows.filter((r) => !r.valid).length;
  const includedCount = reviewRows.filter((r) => r.valid && r.included).length;

  const handleConfirmImport = async () => {
    setImporting(true);

    const customerIdByName = new Map(customers.map((c) => [c.name.trim().toLowerCase(), c.id]));
    const driverIdByName = new Map(drivers.map((d) => [d.name.trim().toLowerCase(), d.id]));

    const toImport = reviewRows.filter((r) => r.valid && r.included);
    let created = 0;

    for (const row of toImport) {
      const payload = resolveRowPayload(row, customerIdByName, driverIdByName);
      const { error } = await supabase.from("loads").insert(payload);
      if (!error) created++;
    }

    setImporting(false);
    setResults({ created, skipped: reviewRows.length - created, total: reviewRows.length });
    setStep("results");
    if (created > 0) onImported();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Loads</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                dragOver ? "border-primary bg-surface-2" : "border-border bg-card"
              }`}
            >
              {parsing ? (
                <Loader />
              ) : (
                <>
                  <UploadCloud size={32} className="text-muted-foreground" />
                  <p className="text-sm text-silver">Drag and drop your tracking spreadsheet here, or click to browse</p>
                  <p className="text-xs text-muted-foreground">Accepts .xlsx, .xls, and .csv</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        )}

        {step === "mapping" && parsed && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileSpreadsheet size={16} />
              <span>{fileName} · {parsed.rows.length} row{parsed.rows.length === 1 ? "" : "s"} detected</span>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-silver">Preview (first 5 rows)</h3>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-card text-left text-muted-foreground">
                      {parsed.headers.map((h, i) => <th key={i} className="whitespace-nowrap px-3 py-2">{h || `Column ${i + 1}`}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.slice(0, 5).map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                        {parsed.headers.map((_, ci) => <td key={ci} className="whitespace-nowrap px-3 py-2 text-muted-foreground">{row[ci] || "-"}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-silver">Map columns to fields</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {IMPORT_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    <label className="w-40 shrink-0 text-sm text-muted-foreground">
                      {field.label}{field.required && <span className="text-danger"> *</span>}
                    </label>
                    <select
                      value={mapping[field.key] ?? ""}
                      onChange={(e) => setFieldMapping(field.key, e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                    >
                      <option value="">Not mapped</option>
                      {parsed.headers.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {!vinMapped && <p className="mt-2 text-xs text-danger">VIN must be mapped to continue — it's required to create a load.</p>}
            </div>

            <div className="flex gap-3">
              <Button variant="copper" disabled={!vinMapped} onClick={goToReview}>Continue to Review</Button>
              <Button variant="copper-outline" onClick={() => setStep("upload")}>Back</Button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="text-silver">{readyCount}</span> row{readyCount === 1 ? "" : "s"} ready to import ·{" "}
              <span className={errorCount > 0 ? "text-danger" : "text-silver"}>{errorCount}</span> row{errorCount === 1 ? "" : "s"} with errors (missing VIN)
            </p>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-card text-left text-muted-foreground">
                    <th className="px-3 py-2">Include</th>
                    <th className="px-3 py-2">Load ID</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Transporter</th>
                    <th className="px-3 py-2">Vehicle</th>
                    <th className="px-3 py-2">VIN</th>
                    <th className="px-3 py-2">Origin</th>
                    <th className="px-3 py-2">Destination</th>
                    <th className="px-3 py-2">Pickup Cost</th>
                    <th className="px-3 py-2">Additional Charges</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewRows.map((row) => {
                    const v = row.values;
                    const vehicle = [v.year, v.make, v.model].filter(Boolean).join(" ") || "-";
                    return (
                      <tr key={row.rowIndex} className={!row.valid ? "bg-danger/10" : row.rowIndex % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={row.included}
                            disabled={!row.valid}
                            onChange={() => toggleRow(row.rowIndex)}
                          />
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{v.load_id || "-"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{v.customer_name || "-"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{v.transporter_name || "-"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{vehicle}</td>
                        <td className={`px-3 py-2 font-mono ${row.valid ? "text-silver" : "text-danger"}`}>{v.vin || "Missing"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{v.origin || "-"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{v.destination || "-"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{v.pickup_cost || "-"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{v.additional_charges || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button variant="copper" disabled={includedCount === 0 || importing} onClick={handleConfirmImport}>
                {importing ? "Importing…" : `Confirm Import (${includedCount})`}
              </Button>
              <Button variant="copper-outline" disabled={importing} onClick={() => setStep("mapping")}>Back</Button>
            </div>
          </div>
        )}

        {step === "results" && results && (
          <div className="space-y-4 text-center">
            <p className="text-lg text-silver">
              <span className="font-bold text-primary">{results.created}</span> load{results.created === 1 ? "" : "s"} created successfully
            </p>
            <p className="text-sm text-muted-foreground">
              {results.skipped} row{results.skipped === 1 ? "" : "s"} skipped
            </p>
            <Button variant="copper" onClick={handleClose}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportLoadsModal;
