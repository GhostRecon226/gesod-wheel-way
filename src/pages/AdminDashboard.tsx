import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Users, Car, Gavel, ClipboardList, FileText,
  CreditCard, AlertTriangle, Ship, Bell, LogOut, Menu, X, Package,
  Download, Workflow, Mail, Truck,
} from "lucide-react";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminCustomers from "@/components/admin/AdminCustomers";
import AdminVehicles from "@/components/admin/AdminVehicles";
import AdminBids from "@/components/admin/AdminBids";
import AdminQuotes from "@/components/admin/AdminQuotes";
import AdminDocuments from "@/components/admin/AdminDocuments";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminDisputesSection from "@/components/admin/AdminDisputesSection";
import AdminSchedules from "@/components/admin/AdminSchedules";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminListings from "@/components/admin/AdminListings";
import AdminReports from "@/components/admin/AdminReports";
import AdminImportPipeline from "@/components/admin/AdminImportPipeline";
import AdminMessages from "@/components/admin/AdminMessages";
import AdminLoads from "@/components/admin/AdminLoads";
import AdminLoadDetail from "@/components/admin/AdminLoadDetail";
import { can, type Module } from "@/lib/permissions";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";

const SECTIONS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "import", label: "Import Pipeline", icon: Workflow },
  { key: "customers", label: "Customers", icon: Users },
  { key: "vehicles", label: "Vehicles", icon: Car },
  { key: "loads", label: "Loads", icon: Truck },
  { key: "listings", label: "Auction Listings", icon: Package },
  { key: "bids", label: "Bid Requests", icon: Gavel },
  { key: "quotes", label: "Quote Requests", icon: ClipboardList },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "disputes", label: "Disputes", icon: AlertTriangle },
  { key: "schedules", label: "Sailing Schedules", icon: Ship },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "messages", label: "Messages", icon: Mail },
  { key: "reports", label: "Reports & Exports", icon: Download },
] as const;

type Section = (typeof SECTIONS)[number]["key"];

const AdminDashboard = () => {
  const { userName, userRole, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState<Section>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  useRealtimeAlerts(user?.id, userRole);

  // Loads has real URLs (/dashboard/admin/loads[/:id]) unlike every other
  // section here, which is pure in-page tab state with no URL of its own.
  const isLoadsRoute = location.pathname.startsWith("/dashboard/admin/loads");

  const visibleSections = SECTIONS.filter((s) => can(userRole, s.key as Module));

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };


  const renderContent = () => {
    if (!can(userRole, active as Module)) {
      return <p className="text-muted-foreground">You do not have permission to view this module.</p>;
    }
    switch (active) {
      case "overview": return <AdminOverview />;
      case "import": return <AdminImportPipeline />;
      case "customers": return <AdminCustomers />;
      case "vehicles": return <AdminVehicles />;
      case "listings": return <AdminListings />;
      case "bids": return <AdminBids />;
      case "quotes": return <AdminQuotes />;
      case "documents": return <AdminDocuments />;
      case "payments": return <AdminPayments />;
      case "disputes": return <AdminDisputesSection />;
      case "schedules": return <AdminSchedules />;
      case "notifications": return <AdminNotifications />;
      case "messages": return <AdminMessages />;
      case "reports": return <AdminReports />;
      // "loads" is routed, not tab-state — see isLoadsRoute below; unreachable here.
      case "loads": return null;
    }
  };


  return (
    <div className="flex min-h-screen bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed z-40 flex h-full w-64 flex-col border-r border-border bg-card transition-transform md:relative md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Logo to="/" />
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {visibleSections.map(({ key, label, icon: Icon }) => {
            const isActive = key === "loads" ? isLoadsRoute : !isLoadsRoute && active === key;
            return (
              <button
                key={key}
                onClick={() => {
                  if (key === "loads") {
                    navigate("/dashboard/admin/loads");
                  } else {
                    setActive(key);
                    if (isLoadsRoute) navigate("/dashboard/admin");
                  }
                  setMobileOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "border-l-[3px] border-primary bg-surface-2 text-silver font-medium"
                    : "border-l-[3px] border-transparent text-muted-foreground hover:text-silver"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <p className="mb-3 truncate text-sm text-muted-foreground">{userName ?? "Admin"}</p>
          <Button variant="destructive" size="sm" className="w-full rounded-lg" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-8">
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-bold text-silver">
            {isLoadsRoute ? "Loads" : SECTIONS.find((s) => s.key === active)?.label}
          </h1>
        </header>
        <div className="p-4 md:p-8">
          {isLoadsRoute ? (
            can(userRole, "loads") ? (
              <Routes>
                <Route path="loads" element={<AdminLoads />} />
                <Route path="loads/:id" element={<AdminLoadDetail />} />
              </Routes>
            ) : (
              <p className="text-muted-foreground">You do not have permission to view this module.</p>
            )
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
