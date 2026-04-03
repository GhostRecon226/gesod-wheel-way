import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DocRow {
  id: string;
  type: string | null;
  file_url: string | null;
  created_at: string;
  vehicle_id: string;
}

const CustomerDocuments = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // RLS already filters to customer's vehicles
    supabase
      .from("documents")
      .select("id, type, file_url, created_at, vehicle_id")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setDocs(data ?? []); setLoading(false); });
  }, [user]);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (docs.length === 0) return <p className="text-muted-foreground">No documents yet.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-muted-foreground">
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d, i) => (
            <tr key={d.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
              <td className="px-4 py-3 text-silver">{d.type ?? "Document"}</td>
              <td className="px-4 py-3 text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                {d.file_url ? (
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10">
                    View / Download
                  </a>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerDocuments;
