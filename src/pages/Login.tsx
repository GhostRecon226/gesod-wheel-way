import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUnconfirmed, setShowUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowUnconfirmed(false);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const code = (error as any).code || error.message;
      if (code === "email_not_confirmed" || error.message?.includes("Email not confirmed")) {
        setShowUnconfirmed(true);
      } else if (code === "invalid_credentials" || error.message?.includes("Invalid login credentials")) {
        toast.error("Incorrect email or password.");
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    const role = roleData?.role ?? "customer";
    navigate(role === "admin" ? "/dashboard/admin" : "/dashboard/customer", { replace: true });
    setLoading(false);
  };

  const handleResendConfirmation = async () => {
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Confirmation email sent! Check your inbox.");
    }
    setResending(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Enter your email address first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent! Check your inbox.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <div className="mb-2 text-center">
          <h1 className="text-3xl font-bold">
            <span className="text-silver">GESOD</span>{" "}
            <span className="text-gold">RIDES</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your trusted vehicle import partner
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
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
              placeholder="••••••••"
              className="auth-input"
            />
          </div>

          {showUnconfirmed && (
            <div className="rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-foreground">
              <p className="mb-2">Your email address is not confirmed yet.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendConfirmation}
                disabled={resending}
                className="border-gold text-gold hover:bg-gold/10"
              >
                {resending ? "Sending..." : "Resend Confirmation Email"}
              </Button>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full rounded-lg">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-gold hover:underline"
          >
            Forgot your password?
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-gold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
