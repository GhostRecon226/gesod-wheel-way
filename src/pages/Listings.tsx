import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";

import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";
import BidRequestModal from "@/components/BidRequestModal";
import { Loader } from "@/components/Spinner";
import ListingCard from "@/components/listings/ListingCard";
import { resolveListingImages } from "@/lib/listingImages";
import { AuctionListing, listingTitle } from "@/lib/listings";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Listings = () => {
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isWatching, toggle, busyId } = useWatchlist();
  const [bidModal, setBidModal] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: "",
    title: "",
  });

  const fetchListings = async () => {
    setLoading(true);
    setError(false);
    const today = new Date().toISOString().split("T")[0];

    const { data, error: fetchError } = await supabase
      .from("auction_listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (fetchError) {
      toast.error("Failed to load data. Please try again.");
      setError(true);
      setLoading(false);
      return;
    }

    // Exclude auctions whose date has passed, soonest auction first
    const active = ((data as AuctionListing[]) ?? [])
      .filter((l) => !l.auction_date || l.auction_date >= today)
      .sort((a, b) => (a.auction_date ?? "9999").localeCompare(b.auction_date ?? "9999"));
    setListings(active);


    // Resolve one cover photo per listing in a single signed-URL request
    const coverRefs = active
      .map((l) => l.images?.[0])
      .filter((ref): ref is string => Boolean(ref));
    const urls = await resolveListingImages(coverRefs);
    const map: Record<string, string> = {};
    let cursor = 0;
    active.forEach((l) => {
      if (l.images?.[0]) {
        const url = urls[cursor++];
        if (url) map[l.id] = url;
      }
    });
    setCovers(map);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const openBid = (listing: AuctionListing) => {
    setBidModal({ open: true, id: listing.id, title: listingTitle(listing) });
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl text-silver">Auction Listings</h1>
          <Link
            to="/listings/archive"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-copper hover:underline"
          >
            View closed auctions
          </Link>
        </div>
        <p className="mt-2 text-muted-foreground">
          Browse available vehicles from US auctions. Each listing shows when bidding opens so you
          can submit a bid request before the auction date.
        </p>


        {/* Disclaimer */}
        <div className="mt-6 rounded-lg border-2 border-gold bg-card p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-gold" size={20} />
            <p className="text-sm text-foreground">
              These vehicles are listed from third-party auction platforms. GESOD RIDES does not own these vehicles.
            </p>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">Failed to load data. Please try again.</p>
            <Button variant="copper-outline" size="sm" className="mt-4" onClick={fetchListings}>
              Retry
            </Button>
          </div>
        ) : listings.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            No active listings at the moment. Check back soon.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((v) => (
              <ListingCard
                key={v.id}
                listing={v}
                imageUrl={covers[v.id]}
                onRequestBid={openBid}
                watching={isWatching(v.id)}
                watchBusy={busyId === v.id}
                onToggleWatch={(l) => toggle(l.id, listingTitle(l))}
              />
            ))}
          </div>
        )}
      </div>

      <BidRequestModal
        open={bidModal.open}
        onClose={() => setBidModal({ open: false, id: "", title: "" })}
        listingId={bidModal.id}
        listingTitle={bidModal.title}
      />
    </PublicLayout>
  );
};

export default Listings;
