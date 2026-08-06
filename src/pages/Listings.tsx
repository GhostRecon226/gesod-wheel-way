import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";
import BidRequestModal from "@/components/BidRequestModal";
import { Loader } from "@/components/Spinner";

interface Listing {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  images: string[] | null;
  lot_number: string | null;
  auction_source: string | null;
  auction_date: string | null;
  yard_location: string | null;
  status: string;
}

const Listings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidModal, setBidModal] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: "",
    title: "",
  });

  useEffect(() => {
    const fetchListings = async () => {
      // Auto-expire past-date listings first
      const today = new Date().toISOString().split("T")[0];

      const { data } = await supabase
        .from("auction_listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      // Filter client-side to exclude past auctions (in case auto-expire hasn't run)
      const active = ((data as Listing[]) ?? []).filter(
        (l) => !l.auction_date || l.auction_date >= today
      );
      setListings(active);
      setLoading(false);
    };
    fetchListings();
  }, []);

  const openBid = (listing: Listing) => {
    const title = `${listing.year ?? ""} ${listing.make ?? ""} ${listing.model ?? ""}`.trim();
    setBidModal({ open: true, id: listing.id, title });
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl text-silver">Auction Listings</h1>
        <p className="mt-2 text-muted-foreground">
          Browse available vehicles from US auctions.
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
        ) : listings.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            No active listings at the moment. Check back soon.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((v) => (
              <div key={v.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="h-48 bg-surface-2">
                  {v.images && v.images[0] ? (
                    <img
                      src={v.images[0]}
                      alt={`${v.make} ${v.model}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg text-silver">
                    {v.year} {v.make} {v.model}
                  </h3>
                  {v.auction_source && (
                    <span className="badge-copper mt-2">{v.auction_source}</span>
                  )}
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {v.lot_number && <p>Lot: {v.lot_number}</p>}
                    {v.yard_location && <p>Yard: {v.yard_location}</p>}
                    {v.auction_date && <p>Auction: {v.auction_date}</p>}
                  </div>
                  <Button
                    variant="copper"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => openBid(v)}
                  >
                    Request Bid
                  </Button>
                </div>
              </div>
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
