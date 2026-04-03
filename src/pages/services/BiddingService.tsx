import { Gavel, ShieldCheck, DollarSign, AlertTriangle } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BiddingService = () => (
  <PublicLayout>
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl text-silver">Auction Bidding Service</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        We bid on your behalf at major US auto auctions — Copart, IAAI, and Manheim.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <Gavel className="text-copper" size={28} />
          <h3 className="mt-3 text-lg text-silver">How It Works</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-4">
            <li>Share the lot number and your maximum bid amount</li>
            <li>Pay a refundable bidding deposit</li>
            <li>Our team registers and bids on auction day</li>
            <li>We notify you of the outcome immediately</li>
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <DollarSign className="text-copper" size={28} />
          <h3 className="mt-3 text-lg text-silver">Fees</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-4">
            <li>Bidding deposit: $200–$500 (refundable if not won)</li>
            <li>Buyer premium: varies by auction (8–15%)</li>
            <li>GESOD RIDES service fee: flat $300 per bid</li>
            <li>Gate/lot fees: passed through at cost</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-gold" size={22} />
          <div>
            <h3 className="text-lg text-silver">Risks & Disclosures</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-disc pl-4">
              <li>Auction vehicles are sold as-is with no warranty</li>
              <li>Title types vary: clean, salvage, rebuilt, parts-only</li>
              <li>Condition reports are provided but not guaranteed</li>
              <li>Winning bids are binding — no cancellations</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link to="/contact">
          <Button variant="copper" size="lg">Request a Bid</Button>
        </Link>
      </div>
    </div>
  </PublicLayout>
);

export default BiddingService;
