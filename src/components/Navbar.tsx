import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Listings", to: "/listings" },
  {
    label: "Services",
    children: [
      { label: "Auction Bidding", to: "/services/bidding" },
      { label: "RORO Shipping", to: "/services/roro" },
      { label: "Inland Towing", to: "/services/towing" },
    ],
  },
  { label: "Track", to: "/track" },
  { label: "Schedule", to: "/schedule" },
  { label: "Get a Quote", to: "/quote" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  const isActive = (to: string) => location.pathname === to;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold no-underline">
          <span className="text-silver">GESOD</span>{" "}
          <span className="text-gold">RIDES</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="relative">
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-gold ${
                    link.children.some((c) => isActive(c.to))
                      ? "text-gold"
                      : "text-foreground"
                  }`}
                  onClick={() => setServicesOpen(!servicesOpen)}
                  onBlur={() => setTimeout(() => setServicesOpen(false), 200)}
                >
                  {link.label}
                  <ChevronDown size={14} />
                </button>
                {servicesOpen && (
                  <div className="absolute left-0 top-full mt-2 w-48 rounded-lg border border-border bg-card py-2 shadow-xl">
                    {link.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className={`block px-4 py-2 text-sm no-underline transition-colors hover:bg-secondary ${
                          isActive(child.to) ? "text-gold" : "text-foreground"
                        }`}
                        onClick={() => setServicesOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.to}
                to={link.to!}
                className={`text-sm font-medium no-underline transition-colors hover:text-gold ${
                  isActive(link.to!) ? "text-gold" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
          <Link to="/login">
            <Button variant="copper" size="sm">
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 md:hidden">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label}>
                <button
                  className="flex w-full items-center justify-between py-3 text-sm font-medium text-foreground"
                  onClick={() => setServicesOpen(!servicesOpen)}
                >
                  {link.label}
                  <ChevronDown size={14} className={servicesOpen ? "rotate-180" : ""} />
                </button>
                {servicesOpen &&
                  link.children.map((child) => (
                    <Link
                      key={child.to}
                      to={child.to}
                      className={`block py-2 pl-4 text-sm no-underline ${
                        isActive(child.to) ? "text-gold" : "text-muted-foreground"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
              </div>
            ) : (
              <Link
                key={link.to}
                to={link.to!}
                className={`block py-3 text-sm font-medium no-underline ${
                  isActive(link.to!) ? "text-gold" : "text-foreground"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            )
          )}
          <Link to="/login" onClick={() => setMobileOpen(false)}>
            <Button variant="copper" size="sm" className="mt-2 w-full">
              Login
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
