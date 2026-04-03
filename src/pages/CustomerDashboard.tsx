import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CustomerDashboard = () => {
  const { userName, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-8 text-center">
        <h1 className="text-2xl font-bold text-silver">Customer Dashboard</h1>
        <p className="mt-4 text-foreground">
          Welcome, <span className="font-semibold text-gold">{userName ?? "Customer"}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Role: <span className="capitalize">{userRole}</span>
        </p>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="mt-8 w-full rounded-lg"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default CustomerDashboard;
