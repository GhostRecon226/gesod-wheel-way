import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/Spinner";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
}

const CustomerNotifications = () => {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setNotifs(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = notifs.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) return <Loader />;

  const hasUnread = notifs.some((n) => !n.read);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-silver">Notifications</h2>
        {hasUnread && (
          <Button variant="copper-outline" size="sm" onClick={markAllRead}>Mark all as read</Button>
        )}
      </div>

      {notifs.length === 0 ? (
        <p className="text-muted-foreground">No notifications.</p>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border border-border p-4 text-sm ${
                n.read ? "bg-card" : "border-l-[3px] border-l-accent bg-surface-2"
              }`}
            >
              <p className="text-silver">{n.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerNotifications;
