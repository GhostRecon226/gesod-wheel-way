import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Gavel,
  Ship,
  MapPin,
  Search,
  ShieldCheck,
  FileText,
  MessageSquare,
  XCircle,
  ArrowRight,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";

const approach = [
  "Process-driven operations with clear milestones",
  "Transparent communication at every stage",
  "Documented workflows and status tracking",
  "No hidden fees or surprise charges",
  "Realistic expectations, not exaggerated promises",
];

const services = [
  {
    icon: Search,
    title: "Vehicle Sourcing Support",
    desc: "We help you source vehicles from auto dealers and major U.S. auction platforms like Copart and IAAI. We provide information on available listings to help you make informed decisions.",
  },
  {
    icon: Gavel,
    title: "Bid-on-Behalf Services",
    desc: "For customers who prefer assistance, we can place bids on your behalf at auctions. You set the maximum bid amount; we handle the bidding process according to your instructions.",
  },
  {
    icon: Ship,
    title: "Ocean Freight Coordination",
    desc: "We coordinate RORO (Roll-on/Roll-off) and container shipping for vehicles heading to international destinations. Quotes are provided based on your specific route and vehicle specifications.",
  },
  {
    icon: MapPin,
    title: "Inland Vehicle Transportation",
    desc: "We arrange inland ground transportation from anywhere in the USA to ports or designated drop-off locations within the United States. Pricing depends on distance and vehicle condition.",
  },
];

const boundaries = [
  {
    title: "We do not own auction vehicles",
    desc: "All vehicles listed on our platform are sourced from third-party auction houses. We facilitate access to these listings but do not hold title or ownership of any vehicle until a transaction is completed on your behalf.",
  },
  {
    title: "We do not guarantee auction outcomes",
    desc: "Auction results depend on market conditions, competing bidders, and reserve prices set by sellers. While we execute bids according to your instructions, winning a specific vehicle is never guaranteed.",
  },
  {
    title: "We do not control customs authorities",
    desc: "Import regulations, duties, and clearance timelines are determined by government authorities at your destination. We provide documentation support, but final clearance decisions rest with customs officials.",
  },
  {
    title: "We do not guarantee vehicle condition",
    desc: "Auction vehicles are sold as-is. We encourage customers to review available auction reports and photos before making bidding decisions. We do not inspect vehicles prior to purchase.",
  },
];

const reasons = [
  {
    icon: ShieldCheck,
    title: "Structured Process",
    desc: "Clear, defined steps from vehicle selection through delivery. No guesswork about what happens next.",
  },
  {
    icon: MapPin,
    title: "Status-Based VIN Tracking",
    desc: "Monitor your vehicle's progress through our tracking system. Status updates are provided as milestones are reached.",
  },
  {
    icon: FileText,
    title: "Centralized Documentation",
    desc: "Access invoices, bills of lading, and other documents through your customer dashboard. All paperwork in one place.",
  },
  {
    icon: MessageSquare,
    title: "Clear Communication",
    desc: "We communicate updates proactively. If there are delays or issues, you will hear from us directly.",
  },
];

const About = () => {
  useEffect(() => {
    document.title = "About GESOD RIDES | Vehicle Sourcing & Logistics";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "GESOD RIDES is a vehicle sourcing and logistics facilitation company coordinating auction bidding, inland transport, and ocean freight from U.S. auctions worldwide.",
      );
    }
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="border-b border-border bg-background py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-copper">
            Vehicle Sourcing &amp; Logistics
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-silver md:text-5xl">
            About GESOD RIDES
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            GESOD RIDES is a vehicle sourcing and logistics facilitation company. We assist
            customers in purchasing vehicles from trusted USA partners and coordinate the movement
            of vehicles from across the USA to destinations worldwide. Our focus is efficient,
            cost-effective solutions that help customers save money and simplify the burden of
            vehicle importation.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-silver">Who We Are</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              GESOD RIDES operates as a facilitation and logistics coordination company. We do
              not manufacture or sell vehicles directly. Instead, we assist customers in
              navigating the vehicle importation process, from auction sourcing to final
              delivery.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Our approach is built on transparency and structured processes. Every step of your
              vehicle's journey is documented, tracked, and communicated clearly. We believe
              informed customers make better decisions, and we prioritize providing accurate
              information over making promises we cannot control.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Whether you are purchasing your first auction vehicle or managing a fleet of
              imports, our goal is to provide consistent, reliable support throughout the
              process.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-silver">Our Approach</h3>
            <ul className="mt-5 space-y-3">
              {approach.map((a) => (
                <li key={a} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-gold" size={16} />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-silver">What We Do</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">
            Our services are designed to support each phase of the vehicle importation process,
            from sourcing to delivery.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {services.map((s) => (
              <div key={s.title} className="rounded-xl border border-border bg-card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary">
                  <s.icon className="text-primary-foreground" size={20} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-silver">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do Not Do */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-bold text-silver">What We Do Not Do</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">
            To maintain transparency, it is important to clarify the boundaries of our services
            and responsibilities.
          </p>
          <ul className="mt-10 space-y-5">
            {boundaries.map((b) => (
              <li
                key={b.title}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-5"
              >
                <XCircle className="mt-0.5 shrink-0 text-copper" size={18} />
                <div>
                  <h3 className="text-sm font-semibold text-silver">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-silver">Why Work With Us</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">
            Our systems and processes are designed to keep you informed and reduce uncertainty
            throughout the importation process.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {reasons.map((r) => (
              <div key={r.title} className="rounded-xl border border-border bg-card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background">
                  <r.icon className="text-gold" size={20} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-silver">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-silver">Ready to Get Started?</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Browse our auction listings, request a freight quote, or track an existing shipment.
            Our team is here to assist you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/listings">
              <Button variant="copper" size="lg">
                View Auction Listings
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/quote">
              <Button variant="outline" size="lg">
                Request a Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About;
