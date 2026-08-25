import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { downloadCsv, downloadJson } from "@/lib/exportData";
import { Car, Gavel, CreditCard, Route, Truck, UserCog, Wallet, Receipt } from "lucide-react";

type ReportKey = "vehicles" | "bids" | "payments" | "milestones" | "loads" | "drivers" | "driver_payments" | "invoices";

type ExportRow = Record<string, unknown>;
type FetchResult = { data: ExportRow[] | null; error: { message: string } | null };

interface SimpleReport {
  key: ReportKey;
  label: string;
  description: string;
  icon: React.ElementType;
  table: keyof Database["public"]["Tables"];
  select: string;
  orderBy: string;
}

interface CustomReport {
  key: ReportKey;
  label: string;
  description: string;
  icon: React.ElementType;
  fetch: () => Promise<FetchResult>;
}

type ReportConfig = SimpleReport | CustomReport;

// The ERP reports below need columns that don't exist directly on their
// table (customer/driver names, load VINs, line-item counts), so each pulls
// its related tables and joins client-side rather than using a plain select.

const fetchLoadsReport = async (): Promise<FetchResult> => {
  const [loadsRes, customersRes, driversRes] = await Promise.all([
    supabase
      .from("loads")
      .select("id, vin, make, model, year, customer_id, driver_id, status, pickup_location, destination_type, destination_address, agreed_pickup_price, service_fee, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("users").select("id, name").eq("role", "customer"),
    supabase.from("drivers").select("id, name"),
  ]);
  if (loadsRes.error) return { data: null, error: loadsRes.error };

  const customerMap = new Map((customersRes.data ?? []).map((c) => [c.id, c.name]));
  const driverMap = new Map((driversRes.data ?? []).map((d) => [d.id, d.name]));

  const rows = (loadsRes.data ?? []).map((l) => ({
    id: l.id,
    vin: l.vin,
    make: l.make,
    model: l.model,
    year: l.year,
    customer_name: l.customer_id ? customerMap.get(l.customer_id) ?? "Unknown" : "Unassigned",
    driver_name: l.driver_id ? driverMap.get(l.driver_id) ?? "Unknown" : "Unassigned",
    status: l.status,
    pickup_location: l.pickup_location,
    destination_type: l.destination_type,
    destination_address: l.destination_address,
    agreed_pickup_price: l.agreed_pickup_price,
    service_fee: l.service_fee,
    created_at: l.created_at,
  }));
  return { data: rows, error: null };
};

const fetchDriversReport = async (): Promise<FetchResult> => {
  const [driversRes, loadsRes] = await Promise.all([
    supabase.from("drivers").select("id, name, phone, email, payment_method, active, created_at").order("name"),
    supabase.from("loads").select("driver_id"),
  ]);
  if (driversRes.error) return { data: null, error: driversRes.error };

  const loadsByDriver = new Map<string, number>();
  for (const l of loadsRes.data ?? []) {
    if (l.driver_id) loadsByDriver.set(l.driver_id, (loadsByDriver.get(l.driver_id) ?? 0) + 1);
  }

  const rows = (driversRes.data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    phone: d.phone,
    email: d.email,
    payment_method: d.payment_method,
    active: d.active,
    total_loads_assigned: loadsByDriver.get(d.id) ?? 0,
  }));
  return { data: rows, error: null };
};

const fetchDriverPaymentsReport = async (): Promise<FetchResult> => {
  const [paymentsRes, driversRes, loadsRes] = await Promise.all([
    supabase.from("driver_payments").select("id, driver_id, load_id, amount, method, status, paid_date").order("paid_date", { ascending: false }),
    supabase.from("drivers").select("id, name"),
    supabase.from("loads").select("id, vin"),
  ]);
  if (paymentsRes.error) return { data: null, error: paymentsRes.error };

  const driverMap = new Map((driversRes.data ?? []).map((d) => [d.id, d.name]));
  const loadMap = new Map((loadsRes.data ?? []).map((l) => [l.id, l.vin]));

  const rows = (paymentsRes.data ?? []).map((p) => ({
    id: p.id,
    driver_name: p.driver_id ? driverMap.get(p.driver_id) ?? "Unknown" : "Unassigned",
    load_vin: p.load_id ? loadMap.get(p.load_id) ?? "Unknown" : "-",
    amount: p.amount,
    method: p.method,
    status: p.status,
    paid_date: p.paid_date,
  }));
  return { data: rows, error: null };
};

const fetchInvoicesReport = async (): Promise<FetchResult> => {
  const [invoicesRes, customersRes, itemsRes] = await Promise.all([
    supabase.from("invoices").select("id, customer_id, total_amount, status, created_at, paid_at").order("created_at", { ascending: false }),
    supabase.from("users").select("id, name").eq("role", "customer"),
    supabase.from("invoice_line_items").select("invoice_id"),
  ]);
  if (invoicesRes.error) return { data: null, error: invoicesRes.error };

  const customerMap = new Map((customersRes.data ?? []).map((c) => [c.id, c.name]));
  const lineItemsByInvoice = new Map<string, number>();
  for (const it of itemsRes.data ?? []) {
    lineItemsByInvoice.set(it.invoice_id, (lineItemsByInvoice.get(it.invoice_id) ?? 0) + 1);
  }

  const rows = (invoicesRes.data ?? []).map((inv) => ({
    id: inv.id,
    customer_name: inv.customer_id ? customerMap.get(inv.customer_id) ?? "Unknown" : "Unassigned",
    total_amount: inv.total_amount,
    status: inv.status,
    line_items_count: lineItemsByInvoice.get(inv.id) ?? 0,
    created_at: inv.created_at,
    paid_at: inv.paid_at,
  }));
  return { data: rows, error: null };
};

const REPORTS: ReportConfig[] = [
  {
    key: "vehicles",
    label: "Vehicles",
    description: "Full vehicle inventory with auction and status details.",
    icon: Car,
    table: "vehicles",
    select:
      "id, vin, make, model, year, title_type, odometer, run_and_drive, status, customer_id, auction_source, lot_number, yard_location, auction_date, created_at",
    orderBy: "created_at",
  },
  {
    key: "bids",
    label: "Bid Requests",
    description: "Customer bid requests, max bids, statuses and admin notes.",
    icon: Gavel,
    table: "bid_requests",
    select: "id, customer_id, vehicle_id, max_bid, status, deposit_status, admin_notes, created_at",
    orderBy: "created_at",
  },
  {
    key: "payments",
    label: "Payments",
    description: "Payment records by stage, amount, currency and status.",
    icon: CreditCard,
    table: "payments",
    select: "id, customer_id, vehicle_id, stage, amount, currency, status, confirmed_by, payment_date",
    orderBy: "payment_date",
  },
  {
    key: "milestones",
    label: "Milestones",
    description: "Vehicle milestone history for logistics auditing.",
    icon: Route,
    table: "vehicle_milestones",
    select: "id, vehicle_id, stage, notes, evidence_url, updated_by, created_at",
    orderBy: "created_at",
  },
  {
    key: "loads",
    label: "Loads",
    description: "US-side load records with customer, driver, route and pricing.",
    icon: Truck,
    fetch: fetchLoadsReport,
  },
  {
    key: "drivers",
    label: "Drivers",
    description: "Driver roster with contact details and assigned load counts.",
    icon: UserCog,
    fetch: fetchDriversReport,
  },
  {
    key: "driver_payments",
    label: "Driver Payments",
    description: "Driver payout records by load, amount, method and status.",
    icon: Wallet,
    fetch: fetchDriverPaymentsReport,
  },
  {
    key: "invoices",
    label: "Invoices",
    description: "Customer invoices with totals, status and line-item counts.",
    icon: Receipt,
    fetch: fetchInvoicesReport,
  },
];

const AdminReports = () => {
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: ReportKey, format: "csv" | "json") => {
    const report = REPORTS.find((r) => r.key === key)!;
    setBusy(`${key}-${format}`);
    const { data, error } =
      "fetch" in report
        ? await report.fetch()
        : await supabase.from(report.table).select(report.select).order(report.orderBy, { ascending: false });
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
