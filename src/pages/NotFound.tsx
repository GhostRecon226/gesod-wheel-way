import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Logo to="/" className="text-2xl" />

      <div className="mt-8 w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-2">
          <Compass className="text-copper" size={26} />
        </div>
        <p className="mt-6 text-5xl font-bold text-gold">404</p>
        <h1 className="mt-3 text-xl font-bold text-silver">Page not found.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Button asChild variant="copper" className="mt-6 w-full">
          <Link to="/">
            <Home size={18} className="mr-2" /> Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
