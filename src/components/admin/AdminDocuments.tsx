import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { downloadCsv, downloadJson } from "@/lib/exportData";

interface DocRow {
  id: string; type: string | null; file_url: string | null;
  created_at: string; vehicle_id: string; uploaded_by: string | null;
  review_status: string; review_notes: string | null; reviewed_at: string | null;
}

interface VehicleRef { id: string; vin: string | null; make: string | null; model: string | null; year: number | null; }

const statusCls: Record<string, string> = {
  pending: "badge-copper",
  approved: "badge-arrived",
  rejected: "inline-block rounded-full px-3 py-1 text-xs font-semibold bg-destructive text-primary-foreground",
};

const maskVin = (vin: string | null) =>
  !vin ? "-" : vin.length <= 8 ? vin : `${vin.slice(0, 4)}••••••${vin.slice(-4)}`;

const AdminDocuments = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [d, v] = await Promise.all([
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
      supabase.from("vehicles").select("id, vin, make, model, year"),
    ]);
    setDocs((d.data ?? []) as DocRow[]);
    setVehicles(v.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const review = async (id: string, status: "approved" | "rejected") => {
    if (!user) return;
    setSaving(true);
    const { error } = await (supabase as any)
      .from("documents")
      .update({
        review_status: status,
        review_notes: reviewNotes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: `Document ${status}` });
      setReviewId(null); setReviewNotes("");
      fetchData();
    }
  };

  const vehicleLabel = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    if (!v) return "-";
    return `${[v.year, v.make, v.model].filter(Boolean).join(" ") || "Vehicle"} · ${maskVin(v.vin)}`;
  };

  const filtered = docs.filter((d) => (filter ? (d.review_status ?? "pending") === filter : true));

  const exportRows = () =>
    filtered.map((d) => ({
      id: d.id,
      type: d.type ?? "",
      vehicle: vehicleLabel(d.vehicle_id),
      review_status: d.review_status ?? "pending",
      review_notes: d.review_notes ?? "",
      uploaded_at: d.created_at,
      reviewed_at: d.reviewed_at ?? "",
      file_url: d.file_url ?? "",
    }));

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-silver">Documents & Review</h2>
        <div className="flex flex-wrap gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
            <option value="">All</option>
            <option value="pending">Pending review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button variant="copper" size="sm" onClick={() => downloadCsv(exportRows(), "gesod-documents")}>CSV</Button>
          <Button variant="copper-outline" size="sm" onClick={() => downloadJson(exportRows(), "gesod-documents")}>JSON</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No documents in this view.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-left text-muted-foreground">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">Review</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const isReviewing = reviewId === d.id;
                return (
                  <tr key={d.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                    <td className="px-4 py-3 text-silver">{d.type ?? "Document"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{vehicleLabel(d.vehicle_id)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={statusCls[d.review_status ?? "pending"] ?? "badge-copper"}>{d.review_status ?? "pending"}</span>
                    </td>
                    <td className="max-w-[220px] px-4 py-3 text-muted-foreground">
                      {isReviewing ? (
                        <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={2} className="auth-input text-xs" placeholder="Review notes (optional)" />
                      ) : (d.review_notes ?? "-")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {d.file_url && (
                          <button type="button" onClick={() => viewDoc(d.file_url!)} className="rounded-md border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10">View</button>
                        )}
                        {isReviewing ? (
                          <>
                            <Button variant="copper" size="sm" disabled={saving} onClick={() => review(d.id, "approved")}>Approve</Button>
                            <Button variant="destructive" size="sm" disabled={saving} onClick={() => review(d.id, "rejected")}>Reject</Button>
                            <Button variant="copper-outline" size="sm" onClick={() => { setReviewId(null); setReviewNotes(""); }}>Cancel</Button>
                          </>
                        ) : (
                          <Button variant="copper-outline" size="sm" onClick={() => { setReviewId(d.id); setReviewNotes(d.review_notes ?? ""); }}>Review</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;
