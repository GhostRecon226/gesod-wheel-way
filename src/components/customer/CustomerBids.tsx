import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Bid {
  id: string;
  max_bid: number | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  vehicle_id: string | null;
}

const statusCls: Record<string, string> = {
  pending: "badge-copper",
  approved: "badge-arrived",
  won: "badge-arrived",
  rejected: "inline-block rounded-full px-3 py-1 text-xs font-semibold bg-destructive text-primary-foreground",
  lost: "inline-block rounded-full px-3 py-1 text-xs font-semibold bg-destructive text-primary-foreground",
};

const CustomerBids = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBids = () => {
    if (!user) return;
    setLoading(true);
    setError(false);
    supabase
      .from("bid_requests")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          toast({ title: "Error", description: "Failed to load data. Please try again.", variant: "destructive" });
          setError(true);
          setLoading(false);
          return;
        }
        setBids(data ?? []);
        setLoading(false);
      });
  };

  useEffect(fetchBids, [user]);

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Failed to load data. Please try again.</p>
        <Button variant="copper-outline" size="sm" className="mt-4" onClick={fetchBids}>
          Retry
        </Button>
      </div>
    );
  }
  if (bids.length === 0) return <p className="text-muted-foreground">No bid requests submitted yet.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-muted-foreground">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Max Bid</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Admin Notes</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((b, i) => (
            <tr key={b.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
              <td className="px-4 py-3 text-silver">{new Date(b.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-silver">{b.max_bid != null ? `$${b.max_bid.toLocaleString()}` : "-"}</td>
              <td className="px-4 py-3"><span className={statusCls[b.status] ?? "badge-copper"}>{b.status}</span></td>
              <td className="px-4 py-3 text-muted-foreground">{b.admin_notes ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerBids;
