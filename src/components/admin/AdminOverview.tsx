import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Car, Gavel, ClipboardList, AlertTriangle, Ship } from "lucide-react";
import { Loader } from "@/components/Spinner";

interface Stat {
  label: string;
  value: number;
  icon: React.ElementType;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [vehicles, bids, quotes, disputes, customs] = await Promise.all([
        supabase.from("vehicles").select("id", { count: "exact", head: true }).ilike("status", "%transit%"),
        supabase.from("bid_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("vehicles").select("id", { count: "exact", head: true }).ilike("status", "%customs%"),
      ]);
      setStats([
        { label: "Vehicles In Transit", value: vehicles.count ?? 0, icon: Car },
        { label: "Pending Bids", value: bids.count ?? 0, icon: Gavel },
        { label: "Pending Quotes", value: quotes.count ?? 0, icon: ClipboardList },
        { label: "Open Disputes", value: disputes.count ?? 0, icon: AlertTriangle },
        { label: "Awaiting Customs", value: customs.count ?? 0, icon: Ship },
      ]);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <s.icon size={20} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-primary">{s.value}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminOverview;
