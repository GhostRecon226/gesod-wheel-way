import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import FieldError from "@/components/FieldError";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { password?: string; confirmPassword?: string } = {};
    if (!password) nextErrors.password = "Password is required.";
    else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";
    else if (password && password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated! Redirecting to login...");
      await supabase.auth.signOut();
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    }
    setLoading(false);
  };

  if (!isRecovery) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Reset Link</h1>
          <p className="text-muted-foreground text-sm">
            This link is invalid or expired. Please request a new password reset from the login page.
          </p>
          <Button className="mt-4" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <div className="mb-2 text-center">
          <Logo className="h-12" />
          <p className="mt-1 text-sm text-muted-foreground">Set your new password</p>
        </div>

        <form onSubmit={handleReset} noValidate className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">New Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
              placeholder="••••••••"
              className="auth-input"
              aria-invalid={!!errors.password}
            />
            <FieldError message={errors.password} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
              placeholder="••••••••"
              className="auth-input"
              aria-invalid={!!errors.confirmPassword}
            />
            <FieldError message={errors.confirmPassword} />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-lg">
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
