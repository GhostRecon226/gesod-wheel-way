import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { downloadCsv, downloadJson } from "@/lib/exportData";
import { Car, Gavel, CreditCard, Route } from "lucide-react";

type ReportKey = "vehicles" | "bids" | "payments" | "milestones";

const REPORTS: {
  key: ReportKey;
  label: string;
  description: string;
  icon: React.ElementType;
  table: string;
  select: string;
}[] = [
  {
    key: "vehicles",
    label: "Vehicles",
    description: "Full vehicle inventory with auction and status details.",
    icon: Car,
    table: "vehicles",
    select:
      "id, vin, make, model, year, title_type, odometer, run_and_drive, status, customer_id, auction_source, lot_number, yard_location, auction_date, created_at",
  },
  {
    key: "bids",
    label: "Bid Requests",
    description: "Customer bid requests, max bids, statuses and admin notes.",
    icon: Gavel,
    table: "bid_requests",
    select: "id, customer_id, vehicle_id, max_bid, status, deposit_status, admin_notes, created_at",
  },
  {
    key: "payments",
    label: "Payments",
    description: "Payment records by stage, amount, currency and status.",
    icon: CreditCard,
    table: "payments",
    select: "id, customer_id, vehicle_id, stage, amount, currency, status, confirmed_by, payment_date",
  },
  {
    key: "milestones",
    label: "Milestones",
    description: "Vehicle milestone history for logistics auditing.",
    icon: Route,
    table: "vehicle_milestones",
    select: "id, vehicle_id, stage, notes, evidence_url, updated_by, created_at",
  },
];

const AdminReports = () => {
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: ReportKey, format: "csv" | "json") => {
    const report = REPORTS.find((r) => r.key === key)!;
    setBusy(`${key}-${format}`);
    const { data, error } = await (supabase as any)
      .from(report.table)
      .select(report.select)
      .order(report.table === "payments" ? "payment_date" : "created_at", { ascending: false });
    setBusy(null);

    if (error) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
      return;
    }
    const rows = (data ?? []) as Record<string, unknown>[];

    if (rows.length === 0) {
      toast({ title: "Nothing to export", description: `No ${report.label.toLowerCase()} records found.` });
      return;
    }
    if (format === "csv") downloadCsv(rows, `gesod-${key}`);
    else downloadJson(rows, `gesod-${key}`);
    toast({ title: `${report.label} exported`, description: `${rows.length} records as ${format.toUpperCase()}.` });
  };

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-silver">Reports & Exports</h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Download operational data as CSV (spreadsheets) or JSON (systems integration).
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {REPORTS.map(({ key, label, description, icon: Icon }) => (
          <div key={key} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-primary" />
              <h3 className="font-semibold text-silver">{label}</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="copper" size="sm" disabled={busy !== null} onClick={() => run(key, "csv")}>
                {busy === `${key}-csv` ? "Exporting…" : "Export CSV"}
              </Button>
              <Button variant="copper-outline" size="sm" disabled={busy !== null} onClick={() => run(key, "json")}>
                {busy === `${key}-json` ? "Exporting…" : "Export JSON"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
