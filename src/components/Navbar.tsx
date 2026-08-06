import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavChild = { label: string; to: string };
type NavItem = { label: string; to?: string; children?: NavChild[] };

const navItems: NavItem[] = [
  {
    label: "Services",
    children: [
      { label: "Vehicle Sourcing", to: "/services/bidding" },
      { label: "Ocean Freight", to: "/services/roro" },
      { label: "Inland Transportation", to: "/services/towing" },
    ],
  },
  {
    label: "Auctions",
    children: [
      { label: "Browse Listings", to: "/listings" },
      { label: "Sailing Schedule", to: "/schedule" },
    ],
  },
  { label: "Track", to: "/track" },
  {
    label: "Company",
    children: [
      { label: "About Us", to: "/about" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "FAQ", to: "/faq" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktop, setOpenDesktop] = useState<string | null>(null);
  const [openMobile, setOpenMobile] = useState<string | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isActive = (to: string) => location.pathname === to;
  const groupActive = (item: NavItem) =>
    !!item.children?.some((c) => isActive(c.to));

  useEffect(() => {
    setOpenDesktop(null);
    setOpenMobile(null);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (desktopRef.current && !desktopRef.current.contains(e.target as Node)) {
        setOpenDesktop(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDesktop(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold no-underline">
          <span className="text-silver">GESOD</span>{" "}
          <span className="text-gold">RIDES</span>
        </Link>

        {/* Desktop nav */}
        <div ref={desktopRef} className="hidden items-center gap-7 md:flex">
          {navItems.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDesktop(item.label)}
                onMouseLeave={() => setOpenDesktop(null)}
              >
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-gold ${
                    groupActive(item) || openDesktop === item.label
                      ? "text-gold"
                      : "text-foreground"
                  }`}
                  aria-expanded={openDesktop === item.label}
                  onClick={() =>
                    setOpenDesktop(openDesktop === item.label ? null : item.label)
                  }
                >
                  {item.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      openDesktop === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openDesktop === item.label && (
                  <div className="absolute left-0 top-full z-50 w-56 pt-2">
                    <div className="rounded-lg border border-border bg-card py-2 shadow-xl">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={`block px-4 py-2 text-sm no-underline transition-colors hover:bg-secondary ${
                            isActive(child.to) ? "text-gold" : "text-foreground"
                          }`}
                          onClick={() => setOpenDesktop(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to!}
                className={`text-sm font-medium no-underline transition-colors hover:text-gold ${
                  isActive(item.to!) ? "text-gold" : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            )
          )}

          <div className="ml-2 flex items-center gap-2">
            <Link to="/quote">
              <Button variant="outline" size="sm">
                Get a Quote
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="copper" size="sm">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="text-foreground md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 md:hidden">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label} className="border-b border-border/50">
                <button
                  className={`flex w-full items-center justify-between py-3 text-sm font-medium ${
                    groupActive(item) ? "text-gold" : "text-foreground"
                  }`}
                  aria-expanded={openMobile === item.label}
                  onClick={() =>
                    setOpenMobile(openMobile === item.label ? null : item.label)
                  }
                >
                  {item.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      openMobile === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openMobile === item.label &&
                  item.children.map((child) => (
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
                key={item.to}
                to={item.to!}
                className={`block border-b border-border/50 py-3 text-sm font-medium no-underline ${
                  isActive(item.to!) ? "text-gold" : "text-foreground"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
          <div className="mt-3 space-y-2">
            <Link to="/quote" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                Get a Quote
              </Button>
            </Link>
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="copper" size="sm" className="w-full">
                Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
