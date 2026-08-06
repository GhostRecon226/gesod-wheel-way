import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";

interface CustomerOption { id: string; name: string; }

const AdminNotifications = () => {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [sendAll, setSendAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("users").select("id, name").eq("role", "customer").order("name")
      .then(({ data }) => { setCustomers(data ?? []); setLoading(false); });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);

    if (sendAll) {
      const inserts = customers.map((c) => ({ user_id: c.id, message: message.trim() }));
      if (inserts.length > 0) {
        const { error } = await supabase.from("notifications").insert(inserts);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else toast({ title: `Sent to ${inserts.length} customers` });
      }
    } else {
      if (!recipientId) { toast({ title: "Select a recipient", variant: "destructive" }); setSubmitting(false); return; }
      const { error } = await supabase.from("notifications").insert({ user_id: recipientId, message: message.trim() });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Notification sent" });
    }

    setMessage("");
    setRecipientId("");
    setSubmitting(false);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-silver">Send Notification</h2>
      <form onSubmit={handleSend} className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-xl">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={sendAll} onChange={(e) => setSendAll(e.target.checked)} /> Send to all customers
        </label>

        {!sendAll && (
          <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground" required={!sendAll}>
            <option value="">Select customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}

        <Textarea placeholder="Notification message" value={message} onChange={(e) => setMessage(e.target.value)} className="auth-input" rows={4} required />
        <Button variant="copper" type="submit" disabled={submitting} className="w-full">
          {submitting ? "Sending…" : "Send Notification"}
        </Button>
      </form>
    </div>
  );
};

export default AdminNotifications;
