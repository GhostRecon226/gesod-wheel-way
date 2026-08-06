import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Bell, Trash2 } from "lucide-react";
import { AuctionListing, formatUsd, listingTitle } from "@/lib/listings";
import { resolveListingImages } from "@/lib/listingImages";
import AuctionCountdown from "@/components/listings/AuctionCountdown";
import { removeFromWatchlist } from "@/lib/watchlist";
import { toast } from "@/hooks/use-toast";

interface WatchedItem {
  id: string;
  created_at: string;
  listing: AuctionListing;
}

const CustomerWatchlist = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("auction_watchlist")
      .select("id, created_at, auction_listings(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const rows = ((data ?? []) as any[])
      .filter((r) => r.auction_listings)
      .map((r) => ({
        id: r.id as string,
        created_at: r.created_at as string,
        listing: r.auction_listings as AuctionListing,
      }));
    setItems(rows);

    const refs = rows
      .map((r) => r.listing.images?.[0])
      .filter((ref): ref is string => Boolean(ref));
    const urls = await resolveListingImages(refs);
    const map: Record<string, string> = {};
    let cursor = 0;
    rows.forEach((r) => {
      if (r.listing.images?.[0]) {
        const url = urls[cursor++];
        if (url) map[r.listing.id] = url;
      }
    });
    setCovers(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const stopWatching = async (listingId: string, title: string) => {
    if (!user) return;
    setBusyId(listingId);
    const { error } = await removeFromWatchlist(user.id, listingId);
    setBusyId(null);
    if (error) {
      toast({ title: "Could not remove", description: error.message, variant: "destructive" });
      return;
    }
    setItems((prev) => prev.filter((i) => i.listing.id !== listingId));
    toast({ title: "Removed from watchlist", description: `${title} will no longer send alerts.` });
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="mb-2 text-lg font-bold text-silver">Watchlist</h2>
      <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Bell size={14} className="text-copper" />
        You get a notification when bidding opens and when bidding closes on these vehicles.
      </p>

      {items.length === 0 ? (
        <p className="text-muted-foreground">
          You are not watching any vehicles yet. Open{" "}
          <Link to="/listings" className="text-copper hover:underline">
            auction listings
          </Link>{" "}
          and select Watch on a vehicle to get bidding alerts.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map(({ id, listing }) => {
            const title = listingTitle(listing);
            return (
              <div
                key={id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row"
              >
                <Link
                  to={`/listings/${listing.id}`}
                  className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-surface-2 sm:w-36"
                >
                  {covers[listing.id] && (
                    <img
                      src={covers[listing.id]}
                      alt={`${title} auction photo`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </Link>

                <div className="flex-1">
                  <Link to={`/listings/${listing.id}`} className="text-silver hover:text-copper">
                    {title}
                  </Link>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {listing.lot_number && <span>Lot {listing.lot_number}</span>}
                    {listing.estimated_value != null && (
                      <span> · Est. {formatUsd(listing.estimated_value)}</span>
                    )}
                  </div>
                  <div className="mt-2">
                    <AuctionCountdown auctionDate={listing.auction_date} />
                  </div>
                </div>

                <div className="flex items-start">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyId === listing.id}
                    onClick={() => stopWatching(listing.id, title)}
                  >
                    <Trash2 size={14} className="mr-1.5" /> Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerWatchlist;
