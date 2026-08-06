import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Bid {
  id: string;
  customer_id: string;
  vehicle_id: string | null;
  max_bid: number | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface CustomerName { id: string; name: string; }

const statusOptions = ["pending", "approved", "rejected", "won", "lost"];
const statusCls: Record<string, string> = {
  pending: "badge-copper", approved: "badge-arrived", won: "badge-arrived",
  rejected: "inline-block rounded-full px-3 py-1 text-xs font-semibold bg-destructive text-primary-foreground",
  lost: "inline-block rounded-full px-3 py-1 text-xs font-semibold bg-destructive text-primary-foreground",
};

const AdminBids = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [customers, setCustomers] = useState<CustomerName[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const fetchData = async () => {
    const [{ data: b }, { data: c }] = await Promise.all([
      supabase.from("bid_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("users").select("id, name").eq("role", "customer"),
    ]);
    setBids(b ?? []);
    setCustomers(c ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const startEdit = (b: Bid) => { setEditId(b.id); setEditStatus(b.status); setEditNotes(b.admin_notes ?? ""); };

  const saveEdit = async () => {
    if (!editId) return;
    const { error } = await supabase.from("bid_requests").update({ status: editStatus as any, admin_notes: editNotes || null }).eq("id", editId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Bid updated" }); setEditId(null); fetchData(); }
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-silver">Bid Requests</h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-muted-foreground">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Max Bid</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((b, i) => {
              const cust = customers.find((c) => c.id === b.customer_id);
              const isEditing = editId === b.id;
              return (
                <tr key={b.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                  <td className="px-4 py-3 text-silver">{cust?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-silver">{b.max_bid != null ? `$${b.max_bid.toLocaleString()}` : "-"}</td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="rounded border border-border bg-surface-2 px-2 py-1 text-xs text-foreground">
                        {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={statusCls[b.status] ?? "badge-copper"}>{b.status}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px]">
                    {isEditing ? (
                      <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="auth-input text-xs" rows={2} />
                    ) : (b.admin_notes ?? "-")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button variant="copper" size="sm" onClick={saveEdit}>Save</Button>
                        <Button variant="copper-outline" size="sm" onClick={() => setEditId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button variant="copper-outline" size="sm" onClick={() => startEdit(b)}>Edit</Button>
                    )}
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

export default AdminBids;
