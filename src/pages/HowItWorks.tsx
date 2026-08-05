import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ClipboardList,
  Gavel,
  Truck,
  Ship,
  MapPin,
  CheckCircle2,
  Info,
  ArrowRight,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    title: "Browse & Select",
    desc: "Review available auction vehicle listings from third-party platforms like Copart and IAAI. Identify vehicles that meet your requirements.",
    checks: [
      "View vehicle photos and auction details",
      "Check lot numbers and auction dates",
      "Research vehicle history independently",
    ],
    action: { label: "View Auction Listings", to: "/listings" },
  },
  {
    icon: ClipboardList,
    title: "Request a Quote",
    desc: "Submit a quote request for the services you need. We provide estimates for bidding assistance, inland transport, and ocean freight.",
    checks: [
      "Specify vehicle and destination details",
      "Receive itemized cost estimates",
      "No commitment required at this stage",
    ],
    action: { label: "Request a Quote", to: "/quote" },
  },
  {
    icon: Gavel,
    title: "Bidding Assistance",
    desc: "If you proceed, we place bids on your behalf according to your maximum bid instructions. Auction outcomes depend on competing bidders and reserve prices.",
    checks: [
      "Set your maximum bid amount",
      "We bid according to your instructions",
      "Receive notification of auction outcome",
    ],
    note: "Winning a specific vehicle is not guaranteed.",
  },
  {
    icon: Truck,
    title: "Inland Transport",
    desc: "Once a vehicle is won, we coordinate pickup from the auction yard and transport to the designated port or location within the United States.",
    checks: [
      "Vehicle pickup from auction yard",
      "Transport to origin port",
      "Handling of drivable and non-drivable vehicles",
    ],
  },
  {
    icon: Ship,
    title: "Ocean Freight",
    desc: "We arrange RORO (Roll-on/Roll-off) shipping from U.S. ports to your destination port. Transit times vary based on route and carrier schedules.",
    checks: [
      "Vessel booking and documentation",
      "Port-to-port shipping",
      "Bill of Lading issuance",
    ],
    note: "Transit times are indicative and subject to change.",
  },
  {
    icon: MapPin,
    title: "Status Updates",
    desc: "Track your vehicle through our VIN tracking system. We provide status updates at key milestones throughout the shipping process.",
    checks: [
      "Status based milestone tracking",
      "Updates via customer portal",
      "Document access through dashboard",
    ],
    action: { label: "Learn About VIN Tracking", to: "/track" },
  },
];

const info = [
  {
    title: "Service Scope",
    desc: "GESOD RIDES facilitates logistics coordination. We work with third-party auction houses, carriers, and shipping lines. We do not own vehicles or transport equipment.",
  },
  {
    title: "Timelines",
    desc: "All transit times and delivery estimates are indicative. Actual timelines depend on carrier schedules, weather, port operations, and customs processing.",
  },
  {
    title: "Auction Outcomes",
    desc: "Winning a specific auction vehicle is not guaranteed. Results depend on competing bidders, reserve prices, and auction conditions.",
  },
  {
    title: "Destination Responsibilities",
    desc: "Customs clearance, import duties, and destination port fees are the responsibility of the client. We provide documentation support but do not handle customs at destination.",
  },
];

const HowItWorks = () => {
  useEffect(() => {
    document.title = "How It Works | GESOD RIDES Vehicle Import Process";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Step-by-step overview of the GESOD RIDES vehicle import process: browsing auctions, quotes, bidding, inland transport, RORO ocean freight, and VIN status updates.",
      );
    }
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="border-b border-border bg-background py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-extrabold text-silver md:text-5xl">How It Works</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From vehicle selection to delivery, here is an overview of the steps involved when
            working with GESOD RIDES. Each stage has defined responsibilities and clear
            communication points.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <ol className="relative space-y-8 sm:pl-16">
            <span
              aria-hidden="true"
              className="absolute left-6 top-6 hidden h-[calc(100%-3rem)] w-px bg-border sm:block"
            />
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="absolute -left-16 top-6 hidden h-12 w-12 items-center justify-center rounded-full border border-border bg-primary sm:flex">
                  <s.icon className="text-primary-foreground" size={20} />
                </span>
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-3 sm:hidden">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                      <s.icon className="text-primary-foreground" size={18} />
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-copper sm:mt-0">
                    Step {i + 1}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-silver">{s.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {s.checks.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-gold" size={16} />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                  {s.note && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-background p-3">
                      <Info className="mt-0.5 shrink-0 text-gold" size={16} />
                      <p className="text-xs text-muted-foreground">{s.note}</p>
                    </div>
                  )}
                  {s.action && (
                    <div className="section-divider mt-5 pt-5">
                      <Link to={s.action.to}>
                        <Button variant="copper-outline" size="sm">
                          {s.action.label}
                          <ArrowRight size={16} />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Important Information */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-silver">Important Information</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {info.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 shrink-0 text-copper" size={18} />
                  <div>
                    <h3 className="text-sm font-semibold text-silver">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-silver">Ready to Learn More?</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Explore our services in detail or browse current auction listings. Our team is
            available to answer questions about the process.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/services/roro">
              <Button variant="copper" size="lg">
                View Our Services
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/listings">
              <Button variant="outline" size="lg">
                Browse Auction Listings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HowItWorks;
