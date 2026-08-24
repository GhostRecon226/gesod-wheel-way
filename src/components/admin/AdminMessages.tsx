import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/Spinner";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const toggleRead = async (m: ContactMessage) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ read: !m.read })
      .eq("id", m.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: !x.read } : x)));
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-silver">Messages</h2>

      {messages.length === 0 ? (
        <p className="text-muted-foreground">No contact messages yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-left text-muted-foreground">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m, i) => (
                <tr key={m.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(m.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-silver">{m.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{m.email}</p>
                    {m.phone && <p>{m.phone}</p>}
                  </td>
                  <td className="px-4 py-3 max-w-xs text-muted-foreground">{m.message}</td>
                  <td className="px-4 py-3">
                    <span className={m.read ? "badge-copper" : "badge-copper bg-accent/20 text-accent"}>
                      {m.read ? "Read" : "Unread"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="copper-outline" size="sm" onClick={() => toggleRead(m)}>
                      {m.read ? "Mark unread" : "Mark read"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
