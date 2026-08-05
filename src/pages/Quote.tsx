import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import { CheckCircle, FileQuestion, Ship, Truck, ArrowRight, ArrowLeft, Info } from "lucide-react";

type QuoteType = "ocean" | "inland";

const portOptions = ["Apapa", "Tin Can Island", "Onne"];

const serviceOptions: {
  id: QuoteType;
  icon: typeof Ship;
  title: string;
  desc: string;
  bullets: string[];
}[] = [
  {
    id: "ocean",
    icon: Ship,
    title: "Ocean Freight (RORO)",
    desc: "Roll-on/Roll-off shipping for vehicles from international ports. Ideal for importing vehicles from the USA, Europe, Japan, and other regions to destinations in Africa.",
    bullets: ["Port-to-port vehicle shipping", "Suitable for cars, SUVs, and trucks", "Typical transit: 4–8 weeks"],
  },
  {
    id: "inland",
    icon: Truck,
    title: "Inland Freight (Vehicle Towing)",
    desc: "Domestic vehicle transport and towing services. Move your vehicle from auction yards, ports, or any location to your desired destination.",
    bullets: ["Door-to-door vehicle transport", "Auction pickup and delivery", "Typical transit: 1–7 days"],
  },
];

const Quote = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<"select" | "form">("select");
  const [selected, setSelected] = useState<QuoteType | null>(null);
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

  if (step === "select") {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-[820px] px-4 py-16">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-2">
              <FileQuestion className="text-copper" size={26} />
            </div>
            <h1 className="mt-5 text-3xl text-silver">Request a Quote</h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Select the type of service you need. We will provide an estimated quote based on your
              vehicle and route details.
            </p>
          </div>

          <div className="mt-10 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg text-silver">Select Service Type</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose the type of freight service you require</p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {serviceOptions.map((s) => {
                const active = selected === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelected(s.id)}
                    className={`rounded-xl border p-5 text-left transition-colors ${
                      active ? "border-primary bg-surface-2" : "border-border bg-surface-2/40 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
                        <s.icon className={active ? "text-gold" : "text-copper"} size={20} />
                      </span>
                      <span className="font-semibold text-silver">{s.title}</span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">{s.desc}</p>
                    <ul className="mt-4 space-y-1.5 pl-4 text-sm text-muted-foreground list-disc">
                      {s.bullets.map((b) => <li key={b}>{b}</li>)}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="copper"
                size="lg"
                disabled={!selected}
                onClick={() => {
                  if (!selected) return;
                  setType(selected);
                  setStep("form");
                }}
              >
                Continue to Quote Form <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-surface-2/40 p-6">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 shrink-0 text-gold" size={20} />
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-silver">Important Notice:</span> Quotes provided
                  through this service are estimates and subject to final confirmation based on vehicle
                  specifications, current shipping schedules, and market conditions.
                </p>
                <p>
                  Final pricing will be confirmed by our team after reviewing your request details.
                  Additional charges may apply for oversized vehicles or special handling requirements.
                </p>
              </div>
            </div>
          </div>

          {!user && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-gold hover:underline">Log in</a> to access your quotes and track requests.
            </p>
          )}
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-[680px] px-4 py-16">
        <h1 className="text-center text-3xl text-silver">
          {type === "ocean" ? "Ocean Freight Quote" : "Inland Towing Quote"}
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          Tell us about your vehicle and route — we will respond within 24 hours.
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
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setStep("select")}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-silver"
              >
                <ArrowLeft size={16} /> Change service type
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
