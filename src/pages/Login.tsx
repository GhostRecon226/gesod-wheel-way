import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import FieldError from "@/components/FieldError";
import Logo from "@/components/Logo";

const stats = [
  { value: "10K+", label: "Vehicles Shipped" },
  { value: "98%", label: "On-Time Delivery" },
  { value: "24/7", label: "Shipment Tracking" },
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUnconfirmed, setShowUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextErrors.email = "Email address is required.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-surface px-12 py-10 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-surface-2/70"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-surface-2/50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-copper to-gold"
        />

        <div className="relative">
          <Logo to="/" className="text-2xl" />
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-4xl font-bold leading-tight">
            Your Trusted Partner in
            <br />
            Vehicle Logistics
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Coordinate auction bidding, inland transport, and ocean freight from one place.
            Track your vehicles, manage documents, and follow every milestone to delivery.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-gold">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Logo to="/" className="text-2xl" />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-card p-8">
            <form onSubmit={handleLogin} noValidate className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="auth-input h-11"
                  aria-invalid={!!errors.email}
                />
                <FieldError message={errors.email} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-gold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input h-11 pr-11"
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={errors.password} />
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

              <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-gold hover:underline">
                Create one
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-gold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-gold hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
