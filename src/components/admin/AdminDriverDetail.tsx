import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";
import { ArrowLeft } from "lucide-react";
import PaymentMethodBadge from "@/components/admin/PaymentMethodBadge";
import DriverFormModal from "@/components/admin/DriverFormModal";
import RecordPaymentModal from "@/components/admin/RecordPaymentModal";
import { ACTIVE_LOAD_STATUSES, type Driver, type DriverPayment } from "@/lib/drivers";

interface LoadRow {
  id: string;
  vin: string;
  make: string | null;
  model: string | null;
  year: number | null;
  customer_id: string | null;
  pickup_location: string | null;
  destination_type: string | null;
  destination_address: string | null;
  status: string | null;
  agreed_pickup_price: number | null;
}

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-right text-sm text-foreground">{value}</span>
  </div>
);

const Panel = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg text-silver">{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

const AdminDriverDetail = () => {
  const { id } = useParams<{ id: string }>();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loads, setLoads] = useState<LoadRow[]>([]);
  const [payments, setPayments] = useState<DriverPayment[]>([]);
  const [customerNames, setCustomerNames] = useState<Map<string, string>>(new Map());
  const [loadVins, setLoadVins] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    setError(false);

    const { data: driverRow, error: driverError } = await supabase
      .from("drivers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (driverError || !driverRow) {
      toast({ title: "Error", description: "Failed to load data. Please try again.", variant: "destructive" });
      setError(true);
      setLoading(false);
      return;
    }
    setDriver(driverRow);

    const [loadsRes, paymentsRes] = await Promise.all([
      supabase.from("loads").select("id, vin, make, model, year, customer_id, pickup_location, destination_type, destination_address, status, agreed_pickup_price").eq("driver_id", id),
      supabase.from("driver_payments").select("*").eq("driver_id", id).order("paid_date", { ascending: false, nullsFirst: false }),
    ]);

    const allLoads = loadsRes.data ?? [];
    setLoads(allLoads);
    setPayments(paymentsRes.data ?? []);
    setLoadVins(new Map(allLoads.map((l) => [l.id, l.vin])));

    const customerIds = Array.from(new Set(allLoads.map((l) => l.customer_id).filter((v): v is string => !!v)));
    if (customerIds.length > 0) {
      const { data: customers } = await supabase.from("users").select("id, name").in("id", customerIds);
      setCustomerNames(new Map((customers ?? []).map((c) => [c.id, c.name])));
    } else {
      setCustomerNames(new Map());
    }

    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [id]);

  const activeLoads = useMemo(
    () => loads.filter((l) => ACTIVE_LOAD_STATUSES.includes(l.status ?? "")),
    [loads]
  );
  const deliveredLoads = useMemo(
    () => loads.filter((l) => l.status === "delivered").map((l) => ({ id: l.id, vin: l.vin })),
    [loads]
  );

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount ?? 0), 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount ?? 0), 0);

  const markPaid = async (paymentId: string) => {
    setMarkingId(paymentId);
    const { error: markError } = await supabase.from("driver_payments").update({ status: "paid" }).eq("id", paymentId);
    setMarkingId(null);
    if (markError) {
      toast({ title: "Error", description: markError.message, variant: "destructive" });
      return;
    }
    toast({ title: "Payment marked as paid" });
    fetchAll();
  };

  if (loading) return <Loader />;

  if (error || !driver) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Failed to load data. Please try again.</p>
        <Button variant="copper-outline" size="sm" className="mt-4" onClick={fetchAll}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <Link to="/dashboard/admin/drivers" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-copper">
        <ArrowLeft size={16} /> Back to drivers
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-silver">{driver.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <PaymentMethodBadge method={driver.payment_method} />
            <span className={driver.active ? "badge-arrived" : "badge-copper"}>{driver.active ? "Active" : "Inactive"}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="copper-outline" onClick={() => setShowEdit(true)}>Edit</Button>
          <Button variant="copper" onClick={() => setShowPayment(true)}>Record Payment</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Panel title="Driver Profile">
            <Field label="Phone" value={driver.phone ?? "-"} />
            <Field label="Email" value={driver.email ?? "-"} />
            <Field label="Payment details" value={driver.payment_details ?? "-"} />
            <Field label="Added" value={new Date(driver.created_at).toLocaleDateString()} />
            {driver.notes && (
              <div className="pt-3">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm text-foreground">{driver.notes}</p>
              </div>
            )}
          </Panel>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="mt-2 text-2xl font-bold text-success">${totalPaid.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total Pending</p>
              <p className="mt-2 text-2xl font-bold text-primary">${totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Panel title="Active Loads">
            {activeLoads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active loads assigned to this driver.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-3">VIN</th>
                      <th className="py-2 pr-3">Customer</th>
                      <th className="py-2 pr-3">Pickup</th>
                      <th className="py-2 pr-3">Destination</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Agreed Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLoads.map((l) => (
                      <tr key={l.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pr-3 font-mono text-xs text-silver">{l.vin}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{l.customer_id ? customerNames.get(l.customer_id) ?? "Unknown" : "Unassigned"}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{l.pickup_location ?? "-"}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{l.destination_type ?? "-"}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{l.status}</td>
                        <td className="py-2 pr-3 text-silver">{l.agreed_pickup_price != null ? `$${l.agreed_pickup_price.toLocaleString()}` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="Payment History">
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded for this driver yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-3">Load VIN</th>
                      <th className="py-2 pr-3">Amount</th>
                      <th className="py-2 pr-3">Method</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pr-3 font-mono text-xs text-silver">{p.load_id ? loadVins.get(p.load_id) ?? "-" : "-"}</td>
                        <td className="py-2 pr-3 text-silver">{p.amount != null ? `$${p.amount.toLocaleString()}` : "-"}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{p.method ?? "-"}</td>
                        <td className="py-2 pr-3">
                          <span className={p.status === "paid" ? "badge-arrived" : "badge-copper"}>{p.status}</span>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{p.paid_date ? new Date(p.paid_date).toLocaleDateString() : "-"}</td>
                        <td className="py-2 pr-3">
                          {p.status === "pending" && (
                            <Button variant="copper-outline" size="sm" disabled={markingId === p.id} onClick={() => markPaid(p.id)}>
                              Mark as Paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>

      <DriverFormModal open={showEdit} onClose={() => setShowEdit(false)} onSaved={fetchAll} editing={driver} />
      <RecordPaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onSaved={fetchAll}
        driver={driver}
        deliveredLoads={deliveredLoads}
      />
    </div>
  );
};

export default AdminDriverDetail;
