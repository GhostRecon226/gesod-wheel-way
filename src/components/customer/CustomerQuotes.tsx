import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Spinner";

interface Quote {
  id: string;
  type: string;
  vehicle_details: string | null;
  status: string;
  amount_usd: number | null;
  amount_ngn: number | null;
  valid_until: string | null;
  created_at: string;
}

const statusCls: Record<string, string> = {
  pending: "badge-copper",
  issued: "badge-departed",
  accepted: "badge-arrived",
  expired: "inline-block rounded-full px-3 py-1 text-xs font-semibold bg-destructive text-primary-foreground",
};

const CustomerQuotes = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("quote_requests")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setQuotes(data ?? []); setLoading(false); });
  }, [user]);

  if (loading) return <Loader />;
  if (quotes.length === 0) return <p className="text-muted-foreground">No quote requests submitted yet.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-muted-foreground">
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">USD</th>
            <th className="px-4 py-3">NGN</th>
            <th className="px-4 py-3">Valid Until</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q, i) => (
            <tr key={q.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
              <td className="px-4 py-3 text-silver capitalize">{q.type}</td>
              <td className="px-4 py-3 text-muted-foreground">{q.vehicle_details ?? "-"}</td>
              <td className="px-4 py-3"><span className={statusCls[q.status] ?? "badge-copper"}>{q.status}</span></td>
              <td className="px-4 py-3 text-silver">{q.amount_usd != null ? `$${q.amount_usd.toLocaleString()}` : "-"}</td>
              <td className="px-4 py-3 text-silver">{q.amount_ngn != null ? `₦${q.amount_ngn.toLocaleString()}` : "-"}</td>
              <td className="px-4 py-3 text-muted-foreground">{q.valid_until ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerQuotes;
