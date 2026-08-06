import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Loader } from "@/components/Spinner";
import ListingCard from "@/components/listings/ListingCard";
import { resolveListingImages } from "@/lib/listingImages";
import { AuctionListing } from "@/lib/listings";

const ListingsArchive = () => {
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchive = async () => {
      const today = new Date().toISOString().split("T")[0];

      const { data } = await supabase
        .from("auction_listings")
        .select("*")
        .order("auction_date", { ascending: false, nullsFirst: false });

      // Archive = auctions whose date has passed, or listings marked expired
      const archived = ((data as AuctionListing[]) ?? []).filter(
        (l) => l.status !== "active" || (l.auction_date != null && l.auction_date < today),
      );
      setListings(archived);

      const coverRefs = archived
        .map((l) => l.images?.[0])
        .filter((ref): ref is string => Boolean(ref));
      const urls = await resolveListingImages(coverRefs);
      const map: Record<string, string> = {};
      let cursor = 0;
      archived.forEach((l) => {
        if (l.images?.[0]) {
          const url = urls[cursor++];
          if (url) map[l.id] = url;
        }
      });
      setCovers(map);
      setLoading(false);
    };
    fetchArchive();
  }, []);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Link
          to="/listings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-copper"
        >
          <ArrowLeft size={16} /> Back to active listings
        </Link>

        <h1 className="mt-4 text-3xl text-silver">Auction Archive</h1>
        <p className="mt-2 text-muted-foreground">
          Vehicles whose auction date has passed. Bidding is closed on these units, they are kept
          here for reference only.
        </p>

        <div className="mt-6 rounded-lg border-2 border-gold bg-card p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-gold" size={20} />
            <p className="text-sm text-foreground">
              These vehicles were listed from third-party auction platforms. GESOD RIDES does not own
              these vehicles and cannot accept new bid requests on closed auctions.
            </p>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : listings.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            No archived auctions yet. Closed listings will appear here.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((v) => (
              <ListingCard
                key={v.id}
                listing={v}
                imageUrl={covers[v.id]}
                onRequestBid={() => undefined}
                archived
              />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default ListingsArchive;
