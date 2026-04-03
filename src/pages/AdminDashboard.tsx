import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, Package } from "lucide-react";
import AdminListings from "@/components/admin/AdminListings";

const AdminDashboard = () => {
  const { userName, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">
            <span className="text-silver">GESOD</span>{" "}
            <span className="text-gold">RIDES</span>
          </h1>
          <span className="text-sm text-muted-foreground">/ Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground">
            {userName ?? "Admin"}
          </span>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <AdminListings />
      </div>
    </div>
  );
};

export default AdminDashboard;
