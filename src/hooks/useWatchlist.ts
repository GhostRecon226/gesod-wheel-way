import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  addToWatchlist,
  fetchWatchedListingIds,
  removeFromWatchlist,
} from "@/lib/watchlist";

/**
 * Tracks which auction listings the signed-in user is watching. Watched
 * listings trigger "bidding opens" and "bidding closed" notifications.
 */
export const useWatchlist = () => {
  const { user } = useAuth();
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      setWatched(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchWatchedListingIds(user.id).then((ids) => {
      if (!active) return;
      setWatched(new Set(ids));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const toggle = useCallback(
    async (listingId: string, listingTitle?: string) => {
      if (!user) {
        toast({
          title: "Sign in to use your watchlist",
          description: "Create an account or log in to get alerts when bidding opens or closes.",
        });
        return;
      }
      setBusyId(listingId);
      const isWatching = watched.has(listingId);
      const { error } = isWatching
        ? await removeFromWatchlist(user.id, listingId)
        : await addToWatchlist(user.id, listingId);
      setBusyId(null);

      if (error) {
        toast({
          title: "Could not update your watchlist",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setWatched((prev) => {
        const next = new Set(prev);
        if (isWatching) next.delete(listingId);
        else next.add(listingId);
        return next;
      });

      toast({
        title: isWatching ? "Removed from watchlist" : "Added to watchlist",
        description: isWatching
          ? `${listingTitle ?? "This vehicle"} will no longer send you auction alerts.`
          : `We will notify you when bidding opens and when it closes on ${listingTitle ?? "this vehicle"}.`,
      });
    },
    [user, watched],
  );

  return {
    watched,
    isWatching: (id: string) => watched.has(id),
    toggle,
    loading,
    busyId,
    signedIn: Boolean(user),
  };
};
