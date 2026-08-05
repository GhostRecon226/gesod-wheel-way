import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import { CheckCircle, FileQuestion, Ship, Truck, ArrowRight, ArrowLeft, Info } from "lucide-react";

type QuoteType = "ocean" | "inland";

const serviceOptions: {
  id: QuoteType;
  icon: typeof Ship;
  title: string;
  formTitle: string;
  formSubtitle: string;
  desc: string;
  bullets: string[];
}[] = [
  {
    id: "ocean",
    icon: Ship,
    title: "Ocean Freight (RORO)",
    formTitle: "Ocean Freight (RORO) Quote",
    formSubtitle: "Roll-on/Roll-off shipping for your vehicle",
    desc: "Roll-on/Roll-off shipping for vehicles from international ports. Ideal for importing vehicles from the USA, Europe, Japan, and other regions to destinations in Africa.",
    bullets: ["Port-to-port vehicle shipping", "Suitable for cars, SUVs, and trucks", "Typical transit: 4–8 weeks"],
  },
  {
    id: "inland",
    icon: Truck,
    title: "Inland Freight (Vehicle Towing)",
    formTitle: "Inland Freight (Vehicle Towing) Quote",
    formSubtitle: "Domestic vehicle transport and towing",
    desc: "Domestic vehicle transport and towing services. Move your vehicle from auction yards, ports, or any location to your desired destination.",
    bullets: ["Door-to-door vehicle transport", "Auction pickup and delivery", "Typical transit: 1–7 days"],
  },
];

const vehicleTypes = ["Sedan", "SUV", "Truck / Pickup", "Van", "Motorcycle", "Heavy Equipment", "Other"];
const auctionSources = ["Copart", "IAAI", "Manheim", "Dealer", "Private Seller", "Other"];

const emptyForm = {
  name: "", email: "", phone: "",
  vehicleType: "", make: "", model: "", year: "", vin: "",
  pickup: "", destination: "",
  auctionSource: "", lotNumber: "",
  insurance: false, runDrive: false, notes: "",
};

const Req = () => <span className="text-destructive"> *</span>;

const selectClass =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none";

const Quote = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const paramType = searchParams.get("type");
  const initialType: QuoteType | null =
    paramType === "ocean" || paramType === "inland" ? paramType : null;
  const [step, setStep] = useState<"select" | "form">(initialType ? "form" : "select");
  const [selected, setSelected] = useState<QuoteType | null>(initialType);
  const [type, setType] = useState<QuoteType>(initialType ?? "ocean");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ ...emptyForm });

  const f = (k: string, v: string | boolean) => setForm({ ...form, [k]: v });

  const service = serviceOptions.find((s) => s.id === type)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);

    const vehicleDetails = [
      `${form.year} ${form.make} ${form.model}`.trim(),
      form.vehicleType ? `Type: ${form.vehicleType}` : null,
      form.vin ? `VIN: ${form.vin}` : null,
      type === "ocean" ? `Origin port: ${form.pickup}` : `Pickup: ${form.pickup}`,
      type === "ocean" ? `Destination port: ${form.destination}` : `Delivery: ${form.destination}`,
      form.auctionSource ? `Auction source: ${form.auctionSource}` : null,
      form.lotNumber ? `Lot #: ${form.lotNumber}` : null,
      type === "ocean" ? `Marine insurance: ${form.insurance ? "Yes" : "No"}` : `Run & drive: ${form.runDrive ? "Yes" : "No"}`,
      `Contact: ${form.name}, ${form.email}, ${form.phone}`,
      form.notes ? `Notes: ${form.notes}` : null,
    ].filter(Boolean).join(" | ");

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
      toast({ title: "Please log in", description: "Create an account to submit a quote request.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setSubmitted(false);
  };

  const cancel = () => {
    setForm({ ...emptyForm });
    setSubmitted(false);
    setStep("select");
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
      <div className="mx-auto max-w-[780px] px-4 py-12">
        <button
          type="button"
          onClick={() => setStep("select")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-silver"
        >
          <ArrowLeft size={16} /> Back to Quote Options
        </button>

        {submitted ? (
          <div className="mt-6 rounded-xl border border-success bg-card p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-success" />
            <h2 className="mt-4 text-xl font-bold text-silver">Quote Request Received</h2>
            <p className="mt-2 text-muted-foreground">
              Your quote request has been received. We will respond within 24 hours.
            </p>
            <Button variant="copper" className="mt-6" onClick={resetForm}>Submit Another</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-border bg-card p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2">
                <service.icon className="text-copper" size={22} />
              </span>
              <div>
                <h1 className="text-xl font-bold text-silver">{service.formTitle}</h1>
                <p className="text-sm text-muted-foreground">{service.formSubtitle}</p>
              </div>
            </div>

            {/* Contact Information */}
            <section className="mt-8">
              <h2 className="text-base font-semibold text-silver">Contact Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">How can we reach you regarding this quote?</p>
              <div className="section-divider my-4" />
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Full Name<Req /></label>
                  <Input value={form.name} onChange={(e) => f("name", e.target.value)} className="auth-input" placeholder="John Doe" required maxLength={100} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Email Address<Req /></label>
                  <Input type="email" value={form.email} onChange={(e) => f("email", e.target.value)} className="auth-input" placeholder="john@example.com" required maxLength={255} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Phone Number<Req /></label>
                  <Input value={form.phone} onChange={(e) => f("phone", e.target.value)} className="auth-input" placeholder="+1 (555) 123-4567" required maxLength={20} />
                </div>
              </div>
            </section>

            {/* Vehicle Information */}
            <section className="mt-8">
              <h2 className="text-base font-semibold text-silver">Vehicle Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Details about the vehicle you want to {type === "ocean" ? "ship" : "move"}
              </p>
              <div className="section-divider my-4" />
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Vehicle Type<Req /></label>
                  <select value={form.vehicleType} onChange={(e) => f("vehicleType", e.target.value)} className={selectClass} required>
                    <option value="">Select type</option>
                    {vehicleTypes.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Make<Req /></label>
                  <Input value={form.make} onChange={(e) => f("make", e.target.value)} className="auth-input" placeholder="e.g., Toyota" required maxLength={50} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Model<Req /></label>
                  <Input value={form.model} onChange={(e) => f("model", e.target.value)} className="auth-input" placeholder="e.g., Land Cruiser" required maxLength={50} />
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Year<Req /></label>
                  <Input type="number" value={form.year} onChange={(e) => f("year", e.target.value)} className="auth-input" placeholder="e.g., 2024" required min={1900} max={2030} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-muted-foreground">VIN</label>
                  <Input value={form.vin} onChange={(e) => f("vin", e.target.value)} className="auth-input" placeholder="Vehicle Identification Number" maxLength={17} />
                  <p className="mt-1.5 text-xs text-muted-foreground">Optional - 17 characters</p>
                </div>
              </div>
            </section>

            {/* Shipping / Towing Details */}
            <section className="mt-8">
              <h2 className="text-base font-semibold text-silver">
                {type === "ocean" ? "Shipping Details" : "Towing Details"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {type === "ocean"
                  ? "Origin and destination ports for your shipment"
                  : "Pickup and delivery locations for your vehicle"}
              </p>
              <div className="section-divider my-4" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">
                    {type === "ocean" ? "Origin Port" : "Pickup Location"}<Req />
                  </label>
                  <Input
                    value={form.pickup}
                    onChange={(e) => f("pickup", e.target.value)}
                    className="auth-input"
                    placeholder={type === "ocean" ? "e.g., Los Angeles, USA" : "e.g., Copart Dallas, TX"}
                    required
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">
                    {type === "ocean" ? "Destination Port" : "Delivery Destination"}<Req />
                  </label>
                  <Input
                    value={form.destination}
                    onChange={(e) => f("destination", e.target.value)}
                    className="auth-input"
                    placeholder={type === "ocean" ? "e.g., Lagos, Nigeria" : "e.g., Port of Houston, TX"}
                    required
                    maxLength={200}
                  />
                </div>
              </div>
            </section>

            {/* Additional Information */}
            <section className="mt-8">
              <h2 className="text-base font-semibold text-silver">Additional Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">Optional details about your vehicle source</p>
              <div className="section-divider my-4" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Auction Source</label>
                  <select value={form.auctionSource} onChange={(e) => f("auctionSource", e.target.value)} className={selectClass}>
                    <option value="">Select auction source</option>
                    {auctionSources.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Lot Number</label>
                  <Input value={form.lotNumber} onChange={(e) => f("lotNumber", e.target.value)} className="auth-input" placeholder="e.g., 12345678" maxLength={30} />
                </div>
              </div>

              <div className="mt-4">
                {type === "ocean" ? (
                  <label className="flex items-center gap-3 text-sm text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => f("insurance", !form.insurance)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${form.insurance ? "bg-primary" : "bg-surface-2 border border-border"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-silver transition-transform ${form.insurance ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                    Marine insurance required?
                  </label>
                ) : (
                  <label className="flex items-center gap-3 text-sm text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => f("runDrive", !form.runDrive)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${form.runDrive ? "bg-primary" : "bg-surface-2 border border-border"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-silver transition-transform ${form.runDrive ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                    Vehicle runs and drives?
                  </label>
                )}
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs text-muted-foreground">Additional Notes</label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => f("notes", e.target.value)}
                  className="auth-input"
                  rows={4}
                  maxLength={1000}
                  placeholder="Any special requirements, questions, or additional information..."
                />
                <p className="mt-1.5 text-xs text-muted-foreground">Maximum 1000 characters</p>
              </div>
            </section>

            {/* Disclaimer */}
            <div className="mt-8 rounded-lg border border-border bg-surface-2/40 p-4 text-sm text-muted-foreground">
              Quotes are estimates and subject to final confirmation. Final pricing may vary based on
              vehicle condition, shipping schedules, and port fees.
            </div>

            {/* Actions */}
            <div className="section-divider my-6" />
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={cancel}>Cancel</Button>
              <Button variant="copper" type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Quote Request"}
              </Button>
            </div>

            {!user && (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                <a href="/login" className="text-gold hover:underline">Log in</a> or{" "}
                <a href="/signup" className="text-gold hover:underline">sign up</a> to submit a quote request.
              </p>
            )}
          </form>
        )}
      </div>
    </PublicLayout>
  );
};

export default Quote;
