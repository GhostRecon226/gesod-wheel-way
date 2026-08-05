import { Link } from "react-router-dom";
import { Search, Gavel, Ship, Truck, ShieldCheck, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import heroBg from "@/assets/hero-bg.jpg";

const steps = [
  {
    num: "01",
    icon: Search,
    title: "Find Your Vehicle",
    desc: "Browse auction listings from Copart, IAAI, and other U.S. platforms.",
  },
  {
    num: "02",
    icon: Gavel,
    title: "We Bid For You",
    desc: "Set your maximum bid and we handle the auction process on your behalf.",
  },
  {
    num: "03",
    icon: Ship,
    title: "Secure Shipping",
    desc: "We coordinate inland transport and ocean freight to your destination.",
  },
  {
    num: "04",
    icon: Truck,
    title: "Track & Receive",
    desc: "Monitor your vehicle's journey with VIN tracking until delivery.",
  },
];


const services = [
  { icon: Gavel, title: "Auction Bidding", desc: "Professional bid-on-behalf service across Copart, IAAI, and Manheim." },
  { icon: Ship, title: "RORO Shipping", desc: "Roll-on/Roll-off ocean freight from US ports to Lagos, Onne, and more." },
  { icon: Truck, title: "Inland Towing", desc: "Auction yard pickup and transport to the nearest US departure port." },
];

const stats = [
  { value: "2,500+", label: "Vehicles Delivered" },
  { value: "98%", label: "Customer Satisfaction" },
  { value: "15+", label: "Years of Experience" },
];

const Index = () => (
  <PublicLayout>
    {/* Hero */}
    <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt="Vehicle shipping"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl font-extrabold leading-tight text-silver md:text-5xl lg:text-6xl">
          Import Your{" "}
          <span className="text-gold">Dream Car</span>{" "}
          from the US
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          We source, bid, ship, and clear your vehicle into Nigeria.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/listings">
            <Button variant="copper" size="lg">
              Browse Listings
            </Button>
          </Link>
          <Link to="/quote">
            <Button variant="copper-outline" size="lg">
              Get a Quote
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-12 text-center text-3xl text-silver">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.num} className="rounded-xl border border-border bg-card p-6 text-center">
              <span className="text-3xl font-extrabold text-copper">{s.num}</span>
              <s.icon className="mx-auto mt-4 text-copper" size={36} />
              <h3 className="mt-3 text-lg text-silver">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <div className="section-divider mx-auto max-w-6xl" />

    {/* Services */}
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-12 text-center text-3xl text-silver">Our Services</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="rounded-xl border border-border bg-card p-6">
              <s.icon className="text-copper" size={32} />
              <h3 className="mt-4 text-lg text-silver">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <div className="section-divider mx-auto max-w-6xl" />

    {/* Trust */}
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="mb-12 text-center text-3xl text-silver">Trusted by Thousands</h2>
        <div className="grid gap-8 sm:grid-cols-3 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold text-gold">{s.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Banner */}
    <section className="bg-primary py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold text-primary-foreground">
          Ready to Import Your Next Vehicle?
        </h2>
        <p className="mt-3 text-primary-foreground/80">
          Get started today with a free quote or browse available auction listings.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/contact">
            <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              Contact Us
            </Button>
          </Link>
          <Link to="/listings">
            <Button variant="secondary" size="lg">
              Browse Listings
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default Index;
