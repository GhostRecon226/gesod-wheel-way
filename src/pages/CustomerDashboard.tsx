import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Car, Gavel, FileText, CreditCard, AlertTriangle, Bell, ClipboardList,
  LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import CustomerVehicles from "@/components/customer/CustomerVehicles";
import CustomerBids from "@/components/customer/CustomerBids";
import CustomerQuotes from "@/components/customer/CustomerQuotes";
import CustomerDocuments from "@/components/customer/CustomerDocuments";
import CustomerPayments from "@/components/customer/CustomerPayments";
import CustomerDisputes from "@/components/customer/CustomerDisputes";
import CustomerNotifications from "@/components/customer/CustomerNotifications";
import { can, type Module } from "@/lib/permissions";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";

const SECTIONS = [
  { key: "vehicles", label: "My Vehicles", icon: Car },
  { key: "bids", label: "Bid Requests", icon: Gavel },
  { key: "quotes", label: "Quote Requests", icon: ClipboardList },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "disputes", label: "Disputes", icon: AlertTriangle },
  { key: "notifications", label: "Notifications", icon: Bell },
] as const;

type Section = (typeof SECTIONS)[number]["key"];

const CustomerDashboard = () => {
  const { userName, user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState<Section>("vehicles");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAlert = useCallback(() => setRefreshKey((k) => k + 1), []);
  useRealtimeAlerts(user?.id, userRole, handleAlert);

  const visibleSections = SECTIONS.filter((s) => can(userRole, s.key as Module));

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(({ count }) => setUnreadCount(count ?? 0));
  }, [user, active, refreshKey]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };


  const renderContent = () => {
    if (!can(userRole, active as Module)) {
      return <p className="text-muted-foreground">You do not have permission to view this module.</p>;
    }
    switch (active) {
      case "vehicles": return <CustomerVehicles />;
      case "bids": return <CustomerBids key={refreshKey} />;
      case "quotes": return <CustomerQuotes />;
      case "documents": return <CustomerDocuments />;
      case "payments": return <CustomerPayments />;
      case "disputes": return <CustomerDisputes />;
      case "notifications": return <CustomerNotifications key={refreshKey} />;
    }
  };


  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 flex h-full w-64 flex-col border-r border-border bg-card transition-transform md:relative md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Logo to="/" />
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {visibleSections.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => { setActive(key); setMobileOpen(false); }}
                className={`flex w-full items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "border-l-[3px] border-primary bg-surface-2 text-silver font-medium"
                    : "border-l-[3px] border-transparent text-muted-foreground hover:text-silver"
                }`}
              >
                <Icon size={18} />
                {label}
                {key === "notifications" && unreadCount > 0 && (
                  <span aria-label={`${unreadCount} unread notifications`} className="ml-auto min-w-[20px] rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <p className="mb-3 truncate text-sm text-muted-foreground">
            {userName ?? "Customer"}
          </p>
          <Button variant="destructive" size="sm" className="w-full rounded-lg" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-8">
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-bold text-silver capitalize">
            {SECTIONS.find((s) => s.key === active)?.label}
          </h1>
        </header>
        <div className="p-4 md:p-8">{renderContent()}</div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
