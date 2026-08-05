import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link to="/" className="text-xl font-bold no-underline">
            <span className="text-silver">GESOD</span>{" "}
            <span className="text-gold">RIDES</span>
          </Link>
          <p className="mt-3 text-left text-sm leading-relaxed text-muted-foreground">
            Vehicle sourcing and logistics facilitation. We coordinate auction bidding, inland
            transport, and ocean freight services for clients importing vehicles from the United
            States.
          </p>
          <p className="mt-3 text-left text-sm leading-relaxed text-muted-foreground">
            GESOD RIDES is a logistics facilitation company. We do not own vehicles or transport
            equipment. All services are provided in coordination with third-party partners.
          </p>
        </div>


        {/* Quick Links */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-silver">Quick Links</h4>
          <ul className="space-y-2">
            {[
              { label: "About", to: "/about" },
              { label: "Listings", to: "/listings" },
              { label: "How It Works", to: "/how-it-works" },
              { label: "Track VIN", to: "/track" },
              { label: "Sailing Schedule", to: "/schedule" },
              { label: "FAQ", to: "/faq" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-muted-foreground no-underline hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-silver">Services</h4>
          <ul className="space-y-2">
            {[
              { label: "Vehicle Sourcing", to: "/services/bidding" },
              { label: "Ocean Freight (RORO/Container)", to: "/services/roro" },
              { label: "Inland Transportation", to: "/services/towing" },
              { label: "Get a Quote", to: "/quote" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-muted-foreground no-underline hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-silver">Legal</h4>
          <ul className="space-y-2">
            {[
              { label: "Terms of Service", to: "/terms" },
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Disclaimer", to: "/disclaimer" },
              { label: "Contact", to: "/contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-muted-foreground no-underline hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="section-divider mt-8 pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GESOD RIDES. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
