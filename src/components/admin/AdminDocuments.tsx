import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DocRow {
  id: string; type: string | null; file_url: string | null;
  created_at: string; vehicle_id: string;
}

const AdminDocuments = () => {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("documents").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setDocs(data ?? []); setLoading(false); });
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (docs.length === 0) return <p className="text-muted-foreground">No documents uploaded yet.</p>;

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-silver">Documents</h2>
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
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10">View</a>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDocuments;
