import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Spinner";

interface Payment {
  id: string;
  stage: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_date: string | null;
}

const CustomerPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("payments")
      .select("*")
      .eq("customer_id", user.id)
      .order("payment_date", { ascending: false })
      .then(({ data }) => { setPayments(data ?? []); setLoading(false); });
  }, [user]);

  if (loading) return <Loader />;
  if (payments.length === 0) return <p className="text-muted-foreground">No payments recorded yet.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-muted-foreground">
            <th className="px-4 py-3">Stage</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Currency</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p, i) => (
            <tr key={p.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
              <td className="px-4 py-3 text-silver">{p.stage ?? "-"}</td>
              <td className="px-4 py-3 text-silver">{p.currency === "NGN" ? "₦" : "$"}{p.amount.toLocaleString()}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.currency}</td>
              <td className="px-4 py-3">
                <span className={p.status === "confirmed" ? "badge-arrived" : "badge-copper"}>{p.status}</span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerPayments;
