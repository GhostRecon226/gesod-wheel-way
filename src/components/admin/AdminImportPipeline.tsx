import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { downloadCsv, downloadJson } from "@/lib/exportData";
import { ChevronDown, ChevronRight } from "lucide-react";

const MILESTONE_STAGES = [
  "Bid Requested", "Bid Placed", "Bid Won", "Awaiting Payment", "Payment Confirmed",
  "Towing to US Port", "At US Port", "Vessel Assigned", "Vessel Departed", "In Transit",
  "Vessel Arrived", "Customs Documentation in Progress", "Customs Duty Paid",
  "Vehicle Released from Port", "Out for Delivery", "Delivered to Customer",
];

interface Vehicle {
  id: string; vin: string | null; make: string | null; model: string | null;
  year: number | null; status: string | null; customer_id: string | null;
  auction_source: string | null; lot_number: string | null; auction_date: string | null;
}
interface Milestone { id: string; vehicle_id: string; stage: string; created_at: string; notes: string | null; }
interface Bid { id: string; vehicle_id: string | null; status: string; max_bid: number | null; }
interface Payment { id: string; vehicle_id: string | null; amount: number; currency: string; status: string; stage: string | null; }

const maskVin = (vin: string | null) =>
  !vin ? "—" : vin.length <= 8 ? vin : `${vin.slice(0, 4)}••••••${vin.slice(-4)}`;

const AdminImportPipeline = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [v, m, b, p, c] = await Promise.all([
        supabase.from("vehicles").select("id, vin, make, model, year, status, customer_id, auction_source, lot_number, auction_date").order("created_at", { ascending: false }),
        supabase.from("vehicle_milestones").select("id, vehicle_id, stage, created_at, notes").order("created_at", { ascending: false }),
        supabase.from("bid_requests").select("id, vehicle_id, status, max_bid"),
        supabase.from("payments").select("id, vehicle_id, amount, currency, status, stage"),
        supabase.from("users").select("id, name"),
      ]);
      setVehicles(v.data ?? []);
      setMilestones(m.data ?? []);
      setBids(b.data ?? []);
      setPayments((p.data ?? []) as Payment[]);
      setCustomers(c.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const rows = useMemo(() => {
    return vehicles.map((v) => {
      const vMilestones = milestones.filter((m) => m.vehicle_id === v.id);
      const latest = vMilestones[0] ?? null;
      const stageIndex = latest ? MILESTONE_STAGES.indexOf(latest.stage) : -1;
      const vBids = bids.filter((b) => b.vehicle_id === v.id);
      const vPayments = payments.filter((p) => p.vehicle_id === v.id);
      const paidUsd = vPayments
        .filter((p) => p.status === "confirmed" && p.currency === "USD")
        .reduce((s, p) => s + Number(p.amount), 0);
      return {
        vehicle: v,
        customerName: customers.find((c) => c.id === v.customer_id)?.name ?? "Unassigned",
        milestones: vMilestones,
        latestStage: latest?.stage ?? "Not started",
        progress: stageIndex >= 0 ? Math.round(((stageIndex + 1) / MILESTONE_STAGES.length) * 100) : 0,
        bids: vBids,
        payments: vPayments,
        paidUsd,
        pendingPayments: vPayments.filter((p) => p.status === "pending").length,
      };
    });
  }, [vehicles, milestones, bids, payments, customers]);

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const hay = [r.vehicle.vin, r.vehicle.make, r.vehicle.model, r.vehicle.lot_number, r.customerName]
        .filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (stageFilter && r.latestStage !== stageFilter) return false;
    return true;
  });

  const exportRows = () =>
    filtered.map((r) => ({
      vin: r.vehicle.vin ?? "",
      vehicle: [r.vehicle.year, r.vehicle.make, r.vehicle.model].filter(Boolean).join(" "),
      customer: r.customerName,
      auction_source: r.vehicle.auction_source ?? "",
      lot_number: r.vehicle.lot_number ?? "",
      auction_date: r.vehicle.auction_date ?? "",
      current_stage: r.latestStage,
      progress_percent: r.progress,
      bid_count: r.bids.length,
      bid_statuses: r.bids.map((b) => b.status).join("|"),
      payments_confirmed_usd: r.paidUsd,
      payments_pending: r.pendingPayments,
      milestone_count: r.milestones.length,
    }));

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-silver">Vehicle Import Pipeline</h2>
        <div className="flex gap-2">
          <Button variant="copper" size="sm" onClick={() => downloadCsv(exportRows(), "gesod-import-pipeline")}>Export CSV</Button>
          <Button variant="copper-outline" size="sm" onClick={() => downloadJson(exportRows(), "gesod-import-pipeline")}>Export JSON</Button>
        </div>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        Every vehicle tracked across milestones, auction details, bid requests and payments.
      </p>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Vehicles Tracked", value: rows.length },
          { label: "Awaiting First Milestone", value: rows.filter((r) => r.milestones.length === 0).length },
          { label: "Delivered", value: rows.filter((r) => r.latestStage === "Delivered to Customer").length },
          { label: "Pending Payments", value: rows.reduce((s, r) => s + r.pendingPayments, 0) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search VIN, make, lot, customer…" value={search} onChange={(e) => setSearch(e.target.value)} className="auth-input w-64" />
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
          <option value="">All stages</option>
          <option value="Not started">Not started</option>
          {MILESTONE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No vehicles match these filters.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const open = expanded === r.vehicle.id;
            return (
              <div key={r.vehicle.id} className="rounded-xl border border-border bg-card">
                <button
                  onClick={() => setExpanded(open ? null : r.vehicle.id)}
                  className="flex w-full flex-wrap items-center gap-4 px-4 py-4 text-left"
                >
                  {open ? <ChevronDown size={16} className="text-primary" /> : <ChevronRight size={16} className="text-primary" />}
                  <div className="min-w-[180px]">
                    <p className="font-semibold text-silver">
                      {[r.vehicle.year, r.vehicle.make, r.vehicle.model].filter(Boolean).join(" ") || "Vehicle"}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">{maskVin(r.vehicle.vin)}</p>
                  </div>
                  <div className="min-w-[140px]">
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="text-sm text-silver">{r.customerName}</p>
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{r.latestStage}</span>
                      <span className="text-primary">{r.progress}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${r.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{r.bids.length} bids</span>
                    <span>${r.paidUsd.toLocaleString()} paid</span>
                  </div>
                </button>

                {open && (
                  <div className="grid gap-5 border-t border-border px-4 py-4 md:grid-cols-3">
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-silver">Auction</h4>
                      <dl className="space-y-1 text-xs text-muted-foreground">
                        <div>Source: <span className="text-silver">{r.vehicle.auction_source ?? "—"}</span></div>
                        <div>Lot: <span className="text-silver">{r.vehicle.lot_number ?? "—"}</span></div>
                        <div>Auction date: <span className="text-silver">{r.vehicle.auction_date ? new Date(r.vehicle.auction_date).toLocaleDateString() : "—"}</span></div>
                        <div>Status: <span className="text-silver">{r.vehicle.status ?? "—"}</span></div>
                      </dl>
                      <h4 className="mb-2 mt-4 text-sm font-semibold text-silver">Bids</h4>
                      {r.bids.length === 0 ? <p className="text-xs text-muted-foreground">No bid requests.</p> : (
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {r.bids.map((b) => (
                            <li key={b.id}>
                              {b.max_bid != null ? `$${Number(b.max_bid).toLocaleString()}` : "—"} · <span className="text-silver">{b.status}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-silver">Payments</h4>
                      {r.payments.length === 0 ? <p className="text-xs text-muted-foreground">No payments recorded.</p> : (
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {r.payments.map((p) => (
                            <li key={p.id}>
                              {p.stage ?? "Payment"}: <span className="text-silver">{p.currency} {Number(p.amount).toLocaleString()}</span> · {p.status}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-silver">Milestone History</h4>
                      {r.milestones.length === 0 ? <p className="text-xs text-muted-foreground">No milestones logged yet.</p> : (
                        <ol className="space-y-2 text-xs">
                          {r.milestones.map((m) => (
                            <li key={m.id} className="border-l-2 border-primary pl-3">
                              <p className="text-silver">{m.stage}</p>
                              <p className="text-muted-foreground">{new Date(m.created_at).toLocaleString()}</p>
                              {m.notes && <p className="text-muted-foreground">{m.notes}</p>}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminImportPipeline;
