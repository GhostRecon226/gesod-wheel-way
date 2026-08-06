import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, ArrowLeft, Check, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/Spinner";
import BidRequestModal from "@/components/BidRequestModal";
import ImageGallery from "@/components/listings/ImageGallery";
import AuctionCountdown from "@/components/listings/AuctionCountdown";
import { getAuctionTiming } from "@/lib/auctionTime";
import { resolveListingImages } from "@/lib/listingImages";
import { AuctionListing, formatMiles, formatUsd, listingTitle } from "@/lib/listings";
import { maskVin } from "@/lib/vin";
import NotFound from "@/pages/NotFound";


const Row = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-right text-sm text-foreground">{value ?? "Not specified"}</span>
  </div>
);

const BoolRow = ({ label, value }: { label: string; value: boolean | null }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="flex items-center gap-1 text-sm text-foreground">
      {value ? <Check size={14} className="text-success" /> : <XIcon size={14} className="text-danger" />}
      {value ? "Yes" : "No"}
    </span>
  </div>
);

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <h2 className="mb-3 text-lg text-silver">{title}</h2>
    {children}
  </div>
);

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<AuctionListing | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidOpen, setBidOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("auction_listings")
        .select("*")
        .eq("id", id ?? "")
        .maybeSingle();
      if (!active) return;
      const row = (data as AuctionListing) ?? null;
      setListing(row);
      setImages(await resolveListingImages(row?.images ?? null));
      if (active) setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <Loader />
        </div>
      </PublicLayout>
    );
  }

  if (!listing) return <NotFound />;

  const title = listingTitle(listing);
  const timing = getAuctionTiming(listing.auction_date);
  const biddingClosed = timing.phase === "closed" || listing.status !== "active";


  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Link
          to="/listings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-copper"
        >
          <ArrowLeft size={16} /> Back to listings
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl text-silver">{title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {listing.auction_source && <span className="badge-copper">{listing.auction_source}</span>}
              {listing.lot_number && (
                <span className="text-sm text-muted-foreground">Lot {listing.lot_number}</span>
              )}
              {listing.estimated_value != null && (
                <span className="text-sm text-muted-foreground">
                  Est. retail value {formatUsd(listing.estimated_value)}
                </span>
              )}
            </div>
          </div>
          {biddingClosed ? (
            <span className="rounded-full border border-border bg-surface-2 px-3 py-2 text-sm text-muted-foreground">
              Bidding closed
            </span>
          ) : (
            <Button variant="copper" onClick={() => setBidOpen(true)}>
              Request Bid
            </Button>
          )}
        </div>




        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <ImageGallery images={images} alt={title} />

            <div className="mt-6 rounded-lg border-2 border-gold bg-card p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-gold" size={20} />
                <p className="text-sm text-foreground">
                  This vehicle is listed from a third-party auction platform. GESOD RIDES does not own
                  this vehicle. Photos and condition details are provided by the auction house and
                  should be treated as a guide, not a guarantee.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Panel title="Condition & Damage">
              <Row label="Primary damage" value={listing.primary_damage} />
              <Row label="Secondary damage" value={listing.secondary_damage} />
              <BoolRow label="Run and drive" value={listing.run_and_drive} />
              <BoolRow label="Keys available" value={listing.has_keys} />
              {listing.damage_description && (
                <p className="mt-3 text-sm text-muted-foreground">{listing.damage_description}</p>
              )}
            </Panel>

            <Panel title="Auction Information">
              <Row label="Source" value={listing.auction_source} />
              <Row label="Lot number" value={listing.lot_number} />
              <Row label="Yard location" value={listing.yard_location} />
              <Row label="Auction date" value={listing.auction_date} />
              <Row label="Title type" value={listing.title_type} />
              <Row label="Odometer" value={formatMiles(listing.odometer)} />
            </Panel>

            <Panel title="Vehicle Specifications">
              <Row label="VIN" value={listing.vin ? maskVin(listing.vin) : null} />
              <Row label="Body style" value={listing.body_style} />
              <Row label="Engine" value={listing.engine} />
              <Row label="Transmission" value={listing.transmission} />
              <Row label="Drivetrain" value={listing.drivetrain} />
              <Row label="Fuel type" value={listing.fuel_type} />
              <Row label="Exterior colour" value={listing.exterior_color} />
              <Row label="Interior colour" value={listing.interior_color} />
            </Panel>

            <Button variant="copper" className="w-full" onClick={() => setBidOpen(true)}>
              Request Bid on This Vehicle
            </Button>
          </div>
        </div>
      </div>

      <BidRequestModal
        open={bidOpen}
        onClose={() => setBidOpen(false)}
        listingId={listing.id}
        listingTitle={title}
      />
    </PublicLayout>
  );
};

export default ListingDetail;
