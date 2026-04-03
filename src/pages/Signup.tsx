import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Account created! You can now sign in.");
    navigate("/login", { replace: true });
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        {/* Logo */}
        <div className="mb-2 text-center">
          <h1 className="text-3xl font-bold">
            <span className="text-silver">GESOD</span>{" "}
            <span className="text-gold">RIDES</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your trusted vehicle import partner
          </p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Full Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="auth-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="auth-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="auth-input"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-lg">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
