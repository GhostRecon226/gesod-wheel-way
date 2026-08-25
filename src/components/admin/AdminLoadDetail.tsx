import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";
import { ArrowLeft, FileText } from "lucide-react";
import LoadStatusBadge from "@/components/admin/LoadStatusBadge";
import LoadFormModal from "@/components/admin/LoadFormModal";
import UpdateLoadStatusModal from "@/components/admin/UpdateLoadStatusModal";
import { LOAD_STATUSES, loadTitle, type Load } from "@/lib/loads";
import { openDocument } from "@/lib/documentStorage";

interface StatusHistoryRow {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
}

interface DocRow {
  id: string;
  type: string | null;
  file_url: string | null;
  created_at: string;
}

interface InvoiceRow {
  id: string;
  status: string;
  total_amount: number;
  approved_at: string | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
}

interface DriverPaymentRow {
  id: string;
  amount: number | null;
  method: string | null;
  status: string;
  paid_date: string | null;
}

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-right text-sm text-foreground">{value}</span>
  </div>
);

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <h2 className="mb-3 text-lg text-silver">{title}</h2>
    {children}
  </div>
);

const AdminLoadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [load, setLoad] = useState<Load | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [history, setHistory] = useState<StatusHistoryRow[]>([]);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [invoice, setInvoice] = useState<InvoiceRow | null>(null);
  const [driverPayments, setDriverPayments] = useState<DriverPaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    setError(false);

    const { data: loadRow, error: loadError } = await supabase
      .from("loads")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (loadError || !loadRow) {
      toast({ title: "Error", description: "Failed to load data. Please try again.", variant: "destructive" });
      setError(true);
      setLoading(false);
      return;
    }
    setLoad(loadRow);

    const [
      customersRes,
      driversRes,
      historyRes,
      invoiceLoadRes,
      paymentsRes,
      vehicleRes,
    ] = await Promise.all([
      supabase.from("users").select("id, name").eq("role", "customer"),
      supabase.from("drivers").select("id, name"),
      supabase.from("load_status_history").select("id, status, notes, created_at").eq("load_id", id).order("created_at", { ascending: true }),
      supabase.from("invoice_loads").select("invoice_id").eq("load_id", id).maybeSingle(),
      supabase.from("driver_payments").select("id, amount, method, status, paid_date").eq("load_id", id),
      supabase.from("vehicles").select("id").eq("vin", loadRow.vin),
    ]);

    setCustomers(customersRes.data ?? []);
    setDrivers(driversRes.data ?? []);
    setCustomerName(customersRes.data?.find((c) => c.id === loadRow.customer_id)?.name ?? null);
    setDriverName(driversRes.data?.find((d) => d.id === loadRow.driver_id)?.name ?? null);
    setHistory(historyRes.data ?? []);
    setDriverPayments(paymentsRes.data ?? []);

    if (invoiceLoadRes.data?.invoice_id) {
      const { data: invoiceRow } = await supabase
        .from("invoices")
        .select("id, status, total_amount, approved_at, sent_at, paid_at, created_at")
        .eq("id", invoiceLoadRes.data.invoice_id)
        .maybeSingle();
      setInvoice(invoiceRow ?? null);
    } else {
      setInvoice(null);
    }

    // documents are linked by vehicle_id, not VIN directly — resolve through
    // any vehicles row sharing this load's VIN.
    const vehicleIds = (vehicleRes.data ?? []).map((v) => v.id);
    if (vehicleIds.length > 0) {
      const { data: docRows } = await supabase
        .from("documents")
        .select("id, type, file_url, created_at")
        .in("vehicle_id", vehicleIds)
        .order("created_at", { ascending: false });
      setDocs(docRows ?? []);
    } else {
      setDocs([]);
    }

    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [id]);

  const viewDoc = async (fileUrl: string) => {
    const url = await openDocument(fileUrl);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) return <Loader />;

  if (error || !load) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Failed to load data. Please try again.</p>
        <Button variant="copper-outline" size="sm" className="mt-4" onClick={fetchAll}>Retry</Button>
      </div>
    );
  }

  const currentIdx = LOAD_STATUSES.findIndex((s) => s.value === load.status);
  const latestHistoryFor = (status: string) =>
    [...history].reverse().find((h) => h.status === status);

  return (
    <div>
      <Link to="/dashboard/admin/loads" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-copper">
        <ArrowLeft size={16} /> Back to loads
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-silver">{loadTitle(load)}</h1>
          <p className="font-mono text-sm text-muted-foreground">{load.vin}</p>
          <div className="mt-2"><LoadStatusBadge status={load.status} /></div>
        </div>
        <div className="flex gap-2">
          <Button variant="copper-outline" onClick={() => setShowStatus(true)}>Update Status</Button>
          <Button variant="copper" onClick={() => setShowEdit(true)}>Edit Load</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Panel title="Load Details">
            <Field label="Lot number" value={load.lot_number ?? "-"} />
            <Field label="Buyer number" value={load.buyer_number ?? "-"} />
            <Field label="Customer" value={customerName ?? "Unassigned"} />
            <Field label="Driver assigned" value={driverName ?? "Unassigned"} />
            <Field label="Pickup location" value={load.pickup_location ?? "-"} />
            <Field label="Destination type" value={load.destination_type ?? "-"} />
            <Field label="Destination address" value={load.destination_address ?? "-"} />
            <Field label="Agreed pickup price" value={load.agreed_pickup_price != null ? `$${load.agreed_pickup_price.toLocaleString()}` : "-"} />
            <Field label="Service fee" value={load.service_fee != null ? `$${load.service_fee.toLocaleString()}` : "-"} />
            <Field label="Created" value={new Date(load.created_at).toLocaleString()} />
            {load.notes && (
              <div className="pt-3">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm text-foreground">{load.notes}</p>
              </div>
            )}
          </Panel>

          <Panel title="Linked Documents">
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents found for this VIN.</p>
            ) : (
              <div className="space-y-2">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm text-silver">{d.type ?? "Document"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {d.file_url && (
                      <button type="button" onClick={() => viewDoc(d.file_url!)} className="text-xs font-medium text-primary border border-primary rounded-md px-3 py-1 hover:bg-primary/10">
                        View
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Invoice">
            {invoice ? (
              <>
                <Field label="Status" value={invoice.status} />
                <Field label="Total" value={`$${invoice.total_amount.toLocaleString()}`} />
                <Field label="Created" value={new Date(invoice.created_at).toLocaleDateString()} />
                {invoice.sent_at && <Field label="Sent" value={new Date(invoice.sent_at).toLocaleDateString()} />}
                {invoice.paid_at && <Field label="Paid" value={new Date(invoice.paid_at).toLocaleDateString()} />}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No invoice has been created for this load yet.</p>
            )}
          </Panel>

          <Panel title="Driver Payment">
            {driverPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No driver payment recorded for this load.</p>
            ) : (
              <div className="space-y-2">
                {driverPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm">
                    <span className="text-silver">{p.amount != null ? `$${p.amount.toLocaleString()}` : "-"} {p.method ? `· ${p.method}` : ""}</span>
                    <span className={p.status === "paid" ? "badge-arrived" : "badge-copper"}>{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Status Timeline">
          <div className="space-y-0">
            {LOAD_STATUSES.map((s, i) => {
              const isCompleted = i < currentIdx;
              const isActive = i === currentIdx;
              const isPending = i > currentIdx;
              const isLast = i === LOAD_STATUSES.length - 1;
              const entry = latestHistoryFor(s.value);
              return (
                <div key={s.value} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`relative mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${isCompleted ? "border-primary bg-primary" : isActive ? "border-accent bg-accent" : "border-border bg-transparent"}`}>
                      {isActive && <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-50" />}
                    </div>
                    {!isLast && <div className="w-px flex-1 min-h-[24px] bg-border" />}
                  </div>
                  <div className={`pb-5 ${isPending ? "opacity-50" : ""}`}>
                    <p className="text-sm font-semibold text-silver">{s.label}</p>
                    {entry && (
                      <>
                        {entry.notes && <p className="mt-0.5 text-xs text-muted-foreground">{entry.notes}</p>}
                        <p className="mt-0.5 text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <LoadFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSaved={fetchAll}
        editing={load}
        customers={customers}
        drivers={drivers}
      />
      <UpdateLoadStatusModal
        open={showStatus}
        onClose={() => setShowStatus(false)}
        onUpdated={fetchAll}
        load={load}
      />
    </div>
  );
};

export default AdminLoadDetail;
