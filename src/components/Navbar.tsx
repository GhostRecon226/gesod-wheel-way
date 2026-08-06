import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

type NavChild = { label: string; to: string };
type NavItem = { label: string; to?: string; groupLabel?: string; children?: NavChild[] };

const navItems: NavItem[] = [
  { label: "Home", to: "/" },
  {
    label: "Services",
    groupLabel: "What we do",
    children: [
      { label: "Vehicle Sourcing", to: "/services/bidding" },
      { label: "Ocean Freight", to: "/services/roro" },
      { label: "Inland Transportation", to: "/services/towing" },
    ],
  },
  {
    label: "Auctions",
    groupLabel: "Vehicles & schedule",
    children: [
      { label: "Browse Listings", to: "/listings" },
      { label: "Sailing Schedule", to: "/schedule" },
    ],
  },
  { label: "Track", to: "/track" },
  {
    label: "Company",
    groupLabel: "About GESOD",
    children: [
      { label: "About Us", to: "/about" },
      { label: "How It Works", to: "/how-it-works" },
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
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (desktopRef.current && !desktopRef.current.contains(e.target as Node)) {
        setOpenDesktop(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDesktop(null);
        setMobileOpen(false);
      }
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
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Logo to="/" />

        {/* Desktop nav */}
        <div ref={desktopRef} className="hidden items-center gap-1 md:flex">
          {navItems.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDesktop(item.label)}
                onMouseLeave={() => setOpenDesktop(null)}
              >
                <button
                  className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors hover:text-gold ${
                    groupActive(item)
                      ? "bg-secondary/60 text-gold"
                      : openDesktop === item.label
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
                    size={13}
                    className={`transition-transform ${
                      openDesktop === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openDesktop === item.label && (
                  <div className="absolute left-0 top-full z-50 w-52 pt-1.5">
                    <div className="rounded-md border border-border bg-card p-1 shadow-xl">
                      {item.groupLabel && (
                        <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.groupLabel}
                        </p>
                      )}
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={`block rounded-md px-2.5 py-1.5 text-[13px] no-underline transition-colors hover:bg-secondary ${
                            isActive(child.to)
                              ? "bg-secondary font-medium text-gold"
                              : "text-foreground"
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
                className={`rounded-md px-3 py-1.5 text-[13px] font-medium no-underline transition-colors hover:text-gold ${
                  isActive(item.to!)
                    ? "bg-secondary/60 text-gold"
                    : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            )
          )}

          <div className="ml-3 flex items-center gap-2">
            <Link to="/login">
              <Button variant="copper" size="sm" className="h-8 px-3 text-[13px]">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="text-foreground md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-background/70 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 top-14 z-50 w-[82%] max-w-xs overflow-y-auto border-l border-border bg-card px-4 py-3 md:hidden">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className="border-b border-border/40">
                  <button
                    className={`flex w-full items-center justify-between py-2.5 text-[13px] font-medium ${
                      groupActive(item) ? "text-gold" : "text-foreground"
                    }`}
                    aria-expanded={openMobile === item.label}
                    onClick={() =>
                      setOpenMobile(openMobile === item.label ? null : item.label)
                    }
                  >
                    {item.label}
                    <ChevronDown
                      size={13}
                      className={`transition-transform ${
                        openMobile === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openMobile === item.label && (
                    <div className="pb-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={`block rounded-md px-2 py-1.5 text-[13px] no-underline ${
                            isActive(child.to)
                              ? "bg-secondary font-medium text-gold"
                              : "text-muted-foreground"
                          }`}
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to!}
                  className={`block border-b border-border/40 py-2.5 text-[13px] font-medium no-underline ${
                    isActive(item.to!) ? "text-gold" : "text-foreground"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="mt-3 space-y-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="copper" size="sm" className="h-9 w-full text-[13px]">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
