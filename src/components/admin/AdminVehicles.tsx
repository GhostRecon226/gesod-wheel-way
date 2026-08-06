import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const MILESTONE_STAGES = [
  "Bid Requested","Bid Placed","Bid Won","Awaiting Payment","Payment Confirmed",
  "Towing to US Port","At US Port","Vessel Assigned","Vessel Departed","In Transit",
  "Vessel Arrived","Customs Documentation in Progress","Customs Duty Paid",
  "Vehicle Released from Port","Out for Delivery","Delivered to Customer",
];

interface Vehicle {
  id: string; vin: string | null; make: string | null; model: string | null;
  year: number | null; status: string | null; customer_id: string | null;
  title_type: string | null; damage_description: string | null; odometer: number | null;
  run_and_drive: boolean | null; auction_source: string | null; lot_number: string | null;
  yard_location: string | null; auction_date: string | null;
}

interface CustomerOption { id: string; name: string; }

// VINs are masked everywhere they are displayed; the full value stays editable in the form.
const maskVin = (vin: string | null) =>
  !vin ? "-" : vin.length <= 8 ? vin : `${vin.slice(0, 4)}••••••${vin.slice(-4)}`;

const emptyForm = {
  vin: "", make: "", model: "", year: "", title_type: "", damage_description: "",
  odometer: "", run_and_drive: false, status: "", customer_id: "",
  auction_source: "", lot_number: "", yard_location: "", auction_date: "",
};

const AdminVehicles = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  // Milestone
  const [milestoneVehicle, setMilestoneVehicle] = useState<Vehicle | null>(null);
  const [milestoneStage, setMilestoneStage] = useState(MILESTONE_STAGES[0]);
  const [milestoneNotes, setMilestoneNotes] = useState("");
  const [milestoneEvidence, setMilestoneEvidence] = useState<File | null>(null);
  // Doc upload
  const [docVehicle, setDocVehicle] = useState<Vehicle | null>(null);
  const [docType, setDocType] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);

  const fetchData = async () => {
    const [{ data: v }, { data: c }] = await Promise.all([
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
      supabase.from("users").select("id, name").eq("role", "customer"),
    ]);
    setVehicles(v ?? []);
    setCustomers(c ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const f = (k: string, v: string | boolean) => setForm({ ...form, [k]: v });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      vin: v.vin ?? "", make: v.make ?? "", model: v.model ?? "", year: v.year?.toString() ?? "",
      title_type: v.title_type ?? "", damage_description: v.damage_description ?? "",
      odometer: v.odometer?.toString() ?? "", run_and_drive: v.run_and_drive ?? false,
      status: v.status ?? "", customer_id: v.customer_id ?? "",
      auction_source: v.auction_source ?? "", lot_number: v.lot_number ?? "",
      yard_location: v.yard_location ?? "", auction_date: v.auction_date ?? "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      vin: form.vin || null, make: form.make || null, model: form.model || null,
      year: form.year ? parseInt(form.year) : null, title_type: form.title_type || null,
      damage_description: form.damage_description || null,
      odometer: form.odometer ? parseInt(form.odometer) : null,
      run_and_drive: form.run_and_drive, status: form.status || null,
      customer_id: form.customer_id || null, auction_source: form.auction_source || null,
      lot_number: form.lot_number || null, yard_location: form.yard_location || null,
      auction_date: form.auction_date || null,
    };

    const { error } = editing
      ? await supabase.from("vehicles").update(payload).eq("id", editing.id)
      : await supabase.from("vehicles").insert(payload);

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: editing ? "Vehicle updated" : "Vehicle created" }); setShowForm(false); fetchData(); }
    setSubmitting(false);
  };

  const handleMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneVehicle || !user) return;
    setSubmitting(true);

    let evidenceUrl: string | null = null;
    if (milestoneEvidence) {
      const path = `milestones/${milestoneVehicle.id}/${Date.now()}_${milestoneEvidence.name}`;
      const { error } = await supabase.storage.from("vehicle-documents").upload(path, milestoneEvidence);
      if (!error) { evidenceUrl = supabase.storage.from("vehicle-documents").getPublicUrl(path).data.publicUrl; }
    }

    const { error } = await supabase.from("vehicle_milestones").insert({
      vehicle_id: milestoneVehicle.id, stage: milestoneStage, notes: milestoneNotes || null,
      evidence_url: evidenceUrl, updated_by: user.id,
    });

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Milestone added" });
      setMilestoneVehicle(null); setMilestoneNotes(""); setMilestoneEvidence(null);
    }
    setSubmitting(false);
  };

  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docVehicle || !docFile || !user) return;
    setSubmitting(true);
    const { path, error: uploadErr } = await uploadVehicleDocument(user.id, docVehicle.id, docFile);
    if (uploadErr) { toast({ title: "Upload error", description: uploadErr.message, variant: "destructive" }); setSubmitting(false); return; }
    const { error } = await supabase.from("documents").insert({ vehicle_id: docVehicle.id, type: docType || null, file_url: path, uploaded_by: user.id });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Document uploaded" }); setDocVehicle(null); setDocType(""); setDocFile(null); }
    setSubmitting(false);
  };

  const filtered = vehicles.filter((v) => {
    if (filterStatus && !(v.status ?? "").toLowerCase().includes(filterStatus.toLowerCase())) return false;
    if (filterCustomer && v.customer_id !== filterCustomer) return false;
    return true;
  });

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-silver">Vehicles</h2>
        <Button variant="copper" onClick={openCreate}>Add Vehicle</Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Filter by status…" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="auth-input w-48" />
        <select value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)} className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
          <option value="">All customers</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-bold text-silver">{editing ? "Edit Vehicle" : "New Vehicle"}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input placeholder="VIN" value={form.vin} onChange={(e) => f("vin", e.target.value)} className="auth-input" />
            <Input placeholder="Make" value={form.make} onChange={(e) => f("make", e.target.value)} className="auth-input" />
            <Input placeholder="Model" value={form.model} onChange={(e) => f("model", e.target.value)} className="auth-input" />
            <Input placeholder="Year" type="number" value={form.year} onChange={(e) => f("year", e.target.value)} className="auth-input" />
            <Input placeholder="Title type" value={form.title_type} onChange={(e) => f("title_type", e.target.value)} className="auth-input" />
            <Input placeholder="Odometer" type="number" value={form.odometer} onChange={(e) => f("odometer", e.target.value)} className="auth-input" />
            <Input placeholder="Status" value={form.status} onChange={(e) => f("status", e.target.value)} className="auth-input" />
            <Input placeholder="Auction source" value={form.auction_source} onChange={(e) => f("auction_source", e.target.value)} className="auth-input" />
            <Input placeholder="Lot number" value={form.lot_number} onChange={(e) => f("lot_number", e.target.value)} className="auth-input" />
            <Input placeholder="Yard location" value={form.yard_location} onChange={(e) => f("yard_location", e.target.value)} className="auth-input" />
            <Input placeholder="Auction date" type="date" value={form.auction_date} onChange={(e) => f("auction_date", e.target.value)} className="auth-input" />
            <select value={form.customer_id} onChange={(e) => f("customer_id", e.target.value)} className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
              <option value="">Assign customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Textarea placeholder="Damage description" value={form.damage_description} onChange={(e) => f("damage_description", e.target.value)} className="auth-input" />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={form.run_and_drive} onChange={(e) => f("run_and_drive", e.target.checked)} /> Run & Drive
          </label>
          <div className="flex gap-3">
            <Button variant="copper" type="submit" disabled={submitting}>{editing ? "Update" : "Create"}</Button>
            <Button variant="copper-outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Milestone modal */}
      {milestoneVehicle && (
        <form onSubmit={handleMilestone} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-bold text-silver">Add Milestone: {milestoneVehicle.year} {milestoneVehicle.make} {milestoneVehicle.model}</h3>
          <select value={milestoneStage} onChange={(e) => setMilestoneStage(e.target.value)} className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
            {MILESTONE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Textarea placeholder="Notes (optional)" value={milestoneNotes} onChange={(e) => setMilestoneNotes(e.target.value)} className="auth-input" />
          <Input type="file" accept="image/*" onChange={(e) => setMilestoneEvidence(e.target.files?.[0] ?? null)} className="auth-input" />
          <div className="flex gap-3">
            <Button variant="copper" type="submit" disabled={submitting}>Add Milestone</Button>
            <Button variant="copper-outline" type="button" onClick={() => setMilestoneVehicle(null)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Doc upload */}
      {docVehicle && (
        <form onSubmit={handleDocUpload} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-bold text-silver">Upload Document: {docVehicle.year} {docVehicle.make} {docVehicle.model}</h3>
          <Input placeholder="Document type" value={docType} onChange={(e) => setDocType(e.target.value)} className="auth-input" />
          <Input type="file" onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} className="auth-input" required />
          <div className="flex gap-3">
            <Button variant="copper" type="submit" disabled={submitting}>Upload</Button>
            <Button variant="copper-outline" type="button" onClick={() => setDocVehicle(null)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-muted-foreground">
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">VIN</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => {
              const cust = customers.find((c) => c.id === v.customer_id);
              return (
                <tr key={v.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                  <td className="px-4 py-3 text-silver">{v.year} {v.make} {v.model}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{maskVin(v.vin)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cust?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-3"><span className="badge-copper">{v.status ?? "-"}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="copper-outline" size="sm" onClick={() => openEdit(v)}>Edit</Button>
                      <Button variant="copper-outline" size="sm" onClick={() => setMilestoneVehicle(v)}>+ Milestone</Button>
                      <Button variant="copper-outline" size="sm" onClick={() => setDocVehicle(v)}>+ Doc</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVehicles;
