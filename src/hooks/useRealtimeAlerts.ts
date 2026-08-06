import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AppRole } from "@/lib/permissions";

const DAY = 86400000;

/**
 * Live alerts:
 *  - bid status changes (realtime on bid_requests)
 *  - expiration reminders for auctions the customer bid on and quotes about to lapse
 */
export const useRealtimeAlerts = (
  userId: string | undefined,
  role: AppRole | null,
  onChange?: () => void,
) => {
  const remindedRef = useRef(false);

  useEffect(() => {
    if (!userId || !role) return;

    const channel = supabase
      .channel(`bid-alerts-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bid_requests",
          ...(role === "customer" ? { filter: `customer_id=eq.${userId}` } : {}),
        },
        (payload) => {
          const next = payload.new as { status?: string; max_bid?: number | null };
          const prev = payload.old as { status?: string };
          if (next?.status && next.status !== prev?.status) {
            toast({
              title: `Bid ${next.status}`,
              description:
                next.max_bid != null
                  ? `Your bid request (max $${Number(next.max_bid).toLocaleString()}) is now "${next.status}".`
                  : `A bid request status changed to "${next.status}".`,
            });
            onChange?.();
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bid_requests",
          ...(role === "customer" ? { filter: `customer_id=eq.${userId}` } : {}),
        },
        () => onChange?.(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, role, onChange]);

  // Expiration reminders (once per mount)
  useEffect(() => {
    if (!userId || remindedRef.current) return;
    remindedRef.current = true;

    const soon = new Date(Date.now() + 3 * DAY).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    const run = async () => {
      const [{ data: bids }, { data: quotes }] = await Promise.all([
        supabase
          .from("bid_requests")
          .select("id, vehicle_id, status, vehicles(auction_date, make, model)")
          .eq("status", "pending"),
        supabase
          .from("quote_requests")
          .select("id, valid_until, status")
          .eq("status", "issued")
          .not("valid_until", "is", null)
          .lte("valid_until", soon)
          .gte("valid_until", today),
      ]);

      (bids ?? []).forEach((b: any) => {
        const date = b.vehicles?.auction_date;
        if (!date || date < today || date > soon) return;
        toast({
          title: "Auction closing soon",
          description: `${[b.vehicles?.make, b.vehicles?.model].filter(Boolean).join(" ") || "A vehicle"} auction date is ${new Date(date).toLocaleDateString()}. Bid request still pending.`,
        });
      });

      if ((quotes ?? []).length > 0) {
        toast({
          title: "Quote expiring soon",
          description: `${quotes!.length} quote${quotes!.length > 1 ? "s" : ""} expire within 3 days.`,
        });
      }
    };

    run();
  }, [userId]);
};
