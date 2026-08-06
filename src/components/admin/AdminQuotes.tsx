import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Quote {
  id: string; customer_id: string; type: string; vehicle_details: string | null;
  status: string; amount_usd: number | null; amount_ngn: number | null;
  valid_until: string | null; admin_notes: string | null; created_at: string;
}

interface CustomerName { id: string; name: string; }

const statusOptions = ["pending", "issued", "accepted", "expired"];
const statusCls: Record<string, string> = {
  pending: "badge-copper", issued: "badge-departed", accepted: "badge-arrived",
  expired: "inline-block rounded-full px-3 py-1 text-xs font-semibold bg-destructive text-primary-foreground",
};

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<CustomerName[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: "", amount_usd: "", amount_ngn: "", valid_until: "", admin_notes: "" });

  const fetchData = async () => {
    const [{ data: q }, { data: c }] = await Promise.all([
      supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("users").select("id, name").eq("role", "customer"),
    ]);
    setQuotes(q ?? []);
    setCustomers(c ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const startEdit = (q: Quote) => {
    setEditId(q.id);
    setEditForm({
      status: q.status, amount_usd: q.amount_usd?.toString() ?? "",
      amount_ngn: q.amount_ngn?.toString() ?? "", valid_until: q.valid_until ?? "",
      admin_notes: q.admin_notes ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editId) return;
    const { error } = await supabase.from("quote_requests").update({
      status: editForm.status as any,
      amount_usd: editForm.amount_usd ? parseFloat(editForm.amount_usd) : null,
      amount_ngn: editForm.amount_ngn ? parseFloat(editForm.amount_ngn) : null,
      valid_until: editForm.valid_until || null,
      admin_notes: editForm.admin_notes || null,
    }).eq("id", editId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Quote updated" }); setEditId(null); fetchData(); }
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-silver">Quote Requests</h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-muted-foreground">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">USD</th>
              <th className="px-4 py-3">NGN</th>
              <th className="px-4 py-3">Valid Until</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q, i) => {
              const cust = customers.find((c) => c.id === q.customer_id);
              const isEditing = editId === q.id;
              return (
                <tr key={q.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                  <td className="px-4 py-3 text-silver">{cust?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{q.type}</td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="rounded border border-border bg-surface-2 px-2 py-1 text-xs text-foreground">
                        {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : <span className={statusCls[q.status] ?? "badge-copper"}>{q.status}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? <Input value={editForm.amount_usd} onChange={(e) => setEditForm({ ...editForm, amount_usd: e.target.value })} className="auth-input w-24 text-xs" type="number" /> : <span className="text-silver">{q.amount_usd != null ? `$${q.amount_usd.toLocaleString()}` : "-"}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? <Input value={editForm.amount_ngn} onChange={(e) => setEditForm({ ...editForm, amount_ngn: e.target.value })} className="auth-input w-28 text-xs" type="number" /> : <span className="text-silver">{q.amount_ngn != null ? `₦${q.amount_ngn.toLocaleString()}` : "-"}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? <Input type="date" value={editForm.valid_until} onChange={(e) => setEditForm({ ...editForm, valid_until: e.target.value })} className="auth-input w-36 text-xs" /> : <span className="text-muted-foreground">{q.valid_until ?? "-"}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button variant="copper" size="sm" onClick={saveEdit}>Save</Button>
                        <Button variant="copper-outline" size="sm" onClick={() => setEditId(null)}>Cancel</Button>
                      </div>
                    ) : <Button variant="copper-outline" size="sm" onClick={() => startEdit(q)}>Edit</Button>}
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

export default AdminQuotes;
