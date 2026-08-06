import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import FieldError from "@/components/FieldError";
import Logo from "@/components/Logo";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) nextErrors.name = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Email address is required.";
    if (!password) nextErrors.password = "Password is required.";
    else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
          <Logo to="/" className="text-3xl" />
          <p className="mt-1 text-sm text-muted-foreground">
            Your trusted vehicle import partner
          </p>
        </div>

        <form onSubmit={handleSignup} noValidate className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Full Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="auth-input"
              aria-invalid={!!errors.name}
            />
            <FieldError message={errors.name} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="auth-input"
              aria-invalid={!!errors.email}
            />
            <FieldError message={errors.email} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              placeholder="••••••••"
              className="auth-input"
              aria-invalid={!!errors.password}
            />
            <FieldError message={errors.password} />
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
