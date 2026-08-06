import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Dispute {
  id: string;
  description: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  vehicle_id: string | null;
}

interface VehicleOption {
  id: string;
  label: string;
}

const statusCls: Record<string, string> = {
  open: "badge-copper",
  under_review: "badge-departed",
  resolved: "badge-arrived",
};

const CustomerDisputes = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    const [{ data: d }, { data: v }] = await Promise.all([
      supabase.from("disputes").select("*").eq("customer_id", user.id).order("created_at", { ascending: false }),
      supabase.from("vehicles").select("id, make, model, year").eq("customer_id", user.id),
    ]);
    setDisputes(d ?? []);
    setVehicles((v ?? []).map((x) => ({ id: x.id, label: `${x.year} ${x.make} ${x.model}` })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !description.trim()) return;
    setSubmitting(true);

    let evidenceUrl: string | null = null;
    if (evidence) {
      const path = `disputes/${user.id}/${Date.now()}_${evidence.name}`;
      const { error } = await supabase.storage.from("vehicle-documents").upload(path, evidence);
      if (!error) {
        const { data: pub } = supabase.storage.from("vehicle-documents").getPublicUrl(path);
        evidenceUrl = pub.publicUrl;
      }
    }

    const { error } = await supabase.from("disputes").insert({
      customer_id: user.id,
      vehicle_id: vehicleId || null,
      description: description.trim(),
      evidence_url: evidenceUrl,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dispute filed" });
      setShowForm(false);
      setDescription("");
      setVehicleId("");
      setEvidence(null);
      fetchData();
    }
    setSubmitting(false);
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-silver">Disputes</h2>
        <Button variant="copper" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "File a Dispute"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Vehicle (optional)</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="auth-input" rows={4} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Evidence (optional)</label>
            <Input type="file" accept="image/*,.pdf" onChange={(e) => setEvidence(e.target.files?.[0] ?? null)} className="auth-input" />
          </div>
          <Button variant="copper" type="submit" disabled={submitting} className="w-full">
            {submitting ? "Submitting…" : "Submit Dispute"}
          </Button>
        </form>
      )}

      {disputes.length === 0 ? (
        <p className="text-muted-foreground">No disputes filed.</p>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-silver">{d.description}</p>
                <span className={statusCls[d.status] ?? "badge-copper"}>{d.status.replace("_", " ")}</span>
              </div>
              {d.admin_response && (
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-silver">Admin:</span> {d.admin_response}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDisputes;
