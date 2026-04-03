import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import { CheckCircle } from "lucide-react";

type QuoteType = "ocean" | "inland";

const portOptions = ["Apapa", "Tin Can Island", "Onne"];

const Quote = () => {
  const { user } = useAuth();
  const [type, setType] = useState<QuoteType>("ocean");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    make: "", model: "", year: "", vin: "",
    pickup: "", destination: "",
    insurance: false, runDrive: false, notes: "",
  });

  const f = (k: string, v: string | boolean) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);

    const vehicleDetails = [
      `${form.year} ${form.make} ${form.model}`.trim(),
      form.vin ? `VIN: ${form.vin}` : null,
      `Pickup: ${form.pickup}`,
      `Destination: ${form.destination}`,
      type === "ocean" ? `Marine insurance: ${form.insurance ? "Yes" : "No"}` : `Run & drive: ${form.runDrive ? "Yes" : "No"}`,
      `Contact: ${form.name}, ${form.email}, ${form.phone}`,
      form.notes ? `Notes: ${form.notes}` : null,
    ].filter(Boolean).join(" | ");

    // If logged in use their id, otherwise use a placeholder approach
    const customerId = user?.id;

    if (customerId) {
      const { error } = await supabase.from("quote_requests").insert({
        customer_id: customerId,
        type: type as any,
        vehicle_details: vehicleDetails,
        status: "pending" as any,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }
    } else {
      // Not logged in — store via anon-accessible edge or just show message
      // Since RLS requires customer_id, we inform them to log in or proceed
      toast({ title: "Please log in", description: "Create an account to submit a quote request.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", make: "", model: "", year: "", vin: "", pickup: "", destination: "", insurance: false, runDrive: false, notes: "" });
    setSubmitted(false);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-[680px] px-4 py-16">
        <h1 className="text-center text-3xl text-silver">Request a Quote</h1>
        <p className="mt-2 text-center text-muted-foreground">
          Get a free estimate for ocean freight or inland towing.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-xl border border-success bg-card p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-success" />
            <h2 className="mt-4 text-xl font-bold text-silver">Quote Request Received</h2>
            <p className="mt-2 text-muted-foreground">
              Your quote request has been received. We will respond within 24 hours.
            </p>
            <Button variant="copper" className="mt-6" onClick={resetForm}>Submit Another</Button>
          </div>
        ) : (
          <>
            {/* Toggle */}
            <div className="mt-8 flex rounded-lg overflow-hidden border border-border">
              <button
                type="button"
                onClick={() => setType("ocean")}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  type === "ocean" ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground hover:text-silver"
                }`}
              >
                Ocean Freight Quote
              </button>
              <button
                type="button"
                onClick={() => setType("inland")}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  type === "inland" ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground hover:text-silver"
                }`}
              >
                Inland Towing Quote
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-border bg-card p-6 space-y-5">
              {/* Contact */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-silver">Contact Information</h3>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Full Name *</label>
                  <Input value={form.name} onChange={(e) => f("name", e.target.value)} className="auth-input" required maxLength={100} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Email *</label>
                    <Input type="email" value={form.email} onChange={(e) => f("email", e.target.value)} className="auth-input" required maxLength={255} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Phone</label>
                    <Input value={form.phone} onChange={(e) => f("phone", e.target.value)} className="auth-input" maxLength={20} />
                  </div>
                </div>
              </div>

              {/* Vehicle */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-silver">Vehicle Details</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Make *</label>
                    <Input value={form.make} onChange={(e) => f("make", e.target.value)} className="auth-input" required maxLength={50} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Model *</label>
                    <Input value={form.model} onChange={(e) => f("model", e.target.value)} className="auth-input" required maxLength={50} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Year *</label>
                    <Input type="number" value={form.year} onChange={(e) => f("year", e.target.value)} className="auth-input" required min={1900} max={2030} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">VIN (optional)</label>
                  <Input value={form.vin} onChange={(e) => f("vin", e.target.value)} className="auth-input" maxLength={17} />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-silver">
                  {type === "ocean" ? "Shipping Details" : "Towing Details"}
                </h3>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    {type === "ocean" ? "Auction / Pickup Location (US city & state) *" : "Pickup Location (auction yard & city) *"}
                  </label>
                  <Input value={form.pickup} onChange={(e) => f("pickup", e.target.value)} className="auth-input" required maxLength={200} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    {type === "ocean" ? "Destination Port *" : "Destination US Port *"}
                  </label>
                  {type === "ocean" ? (
                    <select
                      value={form.destination}
                      onChange={(e) => f("destination", e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      required
                    >
                      <option value="">— Select port —</option>
                      {portOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <Input value={form.destination} onChange={(e) => f("destination", e.target.value)} className="auth-input" required maxLength={200} />
                  )}
                </div>

                {type === "ocean" ? (
                  <label className="flex items-center gap-3 text-sm text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => f("insurance", !form.insurance)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${form.insurance ? "bg-primary" : "bg-surface-2 border border-border"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${form.insurance ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                    Marine insurance required?
                  </label>
                ) : (
                  <label className="flex items-center gap-3 text-sm text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => f("runDrive", !form.runDrive)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${form.runDrive ? "bg-primary" : "bg-surface-2 border border-border"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${form.runDrive ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                    Vehicle runs and drives?
                  </label>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Additional Notes</label>
                <Textarea value={form.notes} onChange={(e) => f("notes", e.target.value)} className="auth-input" rows={3} maxLength={1000} />
              </div>

              <Button variant="copper" type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting…" : "Submit Quote Request"}
              </Button>

              {!user && (
                <p className="text-center text-xs text-muted-foreground">
                  <a href="/login" className="text-gold hover:underline">Log in</a> or{" "}
                  <a href="/signup" className="text-gold hover:underline">sign up</a> to submit a quote request.
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </PublicLayout>
  );
};

export default Quote;
