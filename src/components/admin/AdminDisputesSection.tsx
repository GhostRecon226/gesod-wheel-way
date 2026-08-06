import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";

interface Dispute {
  id: string; customer_id: string; vehicle_id: string | null;
  description: string; status: string; admin_response: string | null;
  evidence_url: string | null; created_at: string;
}

interface CustomerName { id: string; name: string; }

const statusOptions = ["open", "under_review", "resolved"];
const statusCls: Record<string, string> = {
  open: "inline-block rounded-full px-3 py-1 text-xs font-semibold bg-destructive text-primary-foreground",
  under_review: "badge-departed",
  resolved: "badge-arrived",
};

const AdminDisputesSection = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [customers, setCustomers] = useState<CustomerName[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editResponse, setEditResponse] = useState("");
  const [editEvidence, setEditEvidence] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    const [{ data: d }, { data: c }] = await Promise.all([
      supabase.from("disputes").select("*").order("created_at", { ascending: false }),
      supabase.from("users").select("id, name").eq("role", "customer"),
    ]);
    setDisputes(d ?? []);
    setCustomers(c ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const startEdit = (d: Dispute) => {
    setEditId(d.id); setEditStatus(d.status); setEditResponse(d.admin_response ?? ""); setEditEvidence(null);
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSubmitting(true);

    let evidenceUrl: string | undefined;
    if (editEvidence) {
      const path = `disputes/admin/${Date.now()}_${editEvidence.name}`;
      const { error } = await supabase.storage.from("vehicle-documents").upload(path, editEvidence);
      if (!error) evidenceUrl = supabase.storage.from("vehicle-documents").getPublicUrl(path).data.publicUrl;
    }

    const update: any = { status: editStatus, admin_response: editResponse || null };
    if (evidenceUrl) update.evidence_url = evidenceUrl;

    const { error } = await supabase.from("disputes").update(update).eq("id", editId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Dispute updated" }); setEditId(null); fetchData(); }
    setSubmitting(false);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-silver">Disputes</h2>
      <div className="space-y-4">
        {disputes.length === 0 && <p className="text-muted-foreground">No disputes.</p>}
        {disputes.map((d) => {
          const cust = customers.find((c) => c.id === d.customer_id);
          const isEditing = editId === d.id;
          return (
            <div key={d.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-silver">{cust?.name ?? "Unknown"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
                </div>
                {isEditing ? (
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="rounded border border-border bg-surface-2 px-2 py-1 text-xs text-foreground">
                    {statusOptions.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                ) : (
                  <span className={statusCls[d.status] ?? "badge-copper"}>{d.status.replace("_", " ")}</span>
                )}
              </div>

              {isEditing ? (
                <div className="mt-4 space-y-3">
                  <Textarea placeholder="Admin response" value={editResponse} onChange={(e) => setEditResponse(e.target.value)} className="auth-input" rows={3} />
                  <Input type="file" accept="image/*,.pdf" onChange={(e) => setEditEvidence(e.target.files?.[0] ?? null)} className="auth-input" />
                  <div className="flex gap-2">
                    <Button variant="copper" size="sm" onClick={saveEdit} disabled={submitting}>Save</Button>
                    <Button variant="copper-outline" size="sm" onClick={() => setEditId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                  <Button variant="copper-outline" size="sm" onClick={() => startEdit(d)}>Respond</Button>
                </div>
              )}

              {d.admin_response && !isEditing && (
                <p className="mt-2 text-xs text-muted-foreground"><span className="font-semibold text-silver">Response:</span> {d.admin_response}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDisputesSection;
