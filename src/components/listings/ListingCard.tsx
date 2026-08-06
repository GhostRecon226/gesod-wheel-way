import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Camera } from "lucide-react";
import { AuctionListing, formatMiles, formatUsd, listingTitle } from "@/lib/listings";
import AuctionCountdown from "@/components/listings/AuctionCountdown";

interface ListingCardProps {
  listing: AuctionListing;
  imageUrl?: string;
  onRequestBid: (listing: AuctionListing) => void;
  /** Archived listings show no bid action. */
  archived?: boolean;
}

const ListingCard = ({ listing, imageUrl, onRequestBid, archived = false }: ListingCardProps) => {
  const title = listingTitle(listing);
  const photoCount = listing.images?.length ?? 0;


  const chips = [
    listing.title_type,
    formatMiles(listing.odometer),
    listing.run_and_drive ? "Run & Drive" : null,
    listing.primary_damage ? `${listing.primary_damage} damage` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-copper">
      <Link to={`/listings/${listing.id}`} className="block">
        <div className="relative h-48 bg-surface-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${title} auction photo`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImageIcon size={24} />
              <span className="text-xs">No photos yet</span>
            </div>
          )}
          {photoCount > 1 && (
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/75 px-2 py-1 text-xs text-muted-foreground">
              <Camera size={12} /> {photoCount} photos
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/listings/${listing.id}`}>
          <h3 className="text-lg text-silver hover:text-copper">{title}</h3>
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {listing.auction_source && <span className="badge-copper">{listing.auction_source}</span>}
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-xs text-muted-foreground"
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          {listing.lot_number && <p>Lot: {listing.lot_number}</p>}
          {listing.yard_location && <p>Yard: {listing.yard_location}</p>}
          {listing.auction_date && <p>Auction: {listing.auction_date}</p>}
          {listing.estimated_value != null && (
            <p>Est. retail value: {formatUsd(listing.estimated_value)}</p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="copper" size="sm" className="flex-1" asChild>
            <Link to={`/listings/${listing.id}`}>View Details</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onRequestBid(listing)}
          >
            Request Bid
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
