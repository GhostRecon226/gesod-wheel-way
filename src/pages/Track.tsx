import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicLayout from "@/components/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

const MILESTONE_ORDER = [
  "Bid Requested",
  "Bid Placed",
  "Bid Won",
  "Awaiting Payment",
  "Payment Confirmed",
  "Towing to US Port",
  "At US Port",
  "Vessel Assigned",
  "Vessel Departed",
  "In Transit",
  "Vessel Arrived",
  "Customs Documentation in Progress",
  "Customs Duty Paid",
  "Vehicle Released from Port",
  "Out for Delivery",
  "Delivered to Customer",
];

interface Milestone {
  id: string;
  stage: string;
  notes: string | null;
  created_at: string;
  evidence_url: string | null;
}

interface VehicleData {
  make: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
}

function maskVin(vin: string) {
  if (vin.length <= 8) return vin;
  return vin.slice(0, 4) + "*".repeat(vin.length - 8) + vin.slice(-4);
}

const RATE_LIMIT_KEY = "gesod_vin_searches";
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(): boolean {
  const now = Date.now();
  const raw = localStorage.getItem(RATE_LIMIT_KEY);
  const timestamps: number[] = raw ? JSON.parse(raw) : [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
  return true;
}

const Track = () => {
  const [vin, setVin] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vin.trim()) return;

    if (!checkRateLimit()) {
      setRateLimited(true);
      return;
    }
    setRateLimited(false);
    setLoading(true);
    setSearched(true);

    const { data: v } = await supabase
      .from("vehicles")
      .select("id, make, model, year, vin, status")
      .eq("vin", vin.trim().toUpperCase())
      .maybeSingle();

    if (!v) {
      setVehicle(null);
      setMilestones([]);
      setLoading(false);
      return;
    }

    setVehicle({ make: v.make, model: v.model, year: v.year, vin: v.vin });

    const { data: ms } = await supabase
      .from("vehicle_milestones")
      .select("id, stage, notes, created_at, evidence_url")
      .eq("vehicle_id", v.id)
      .order("created_at", { ascending: true });

    setMilestones((ms as Milestone[]) ?? []);
    setLoading(false);
  };

  // Build full timeline: map each ordered stage to its milestone data (or null)
  const completedStages = new Set(milestones.map((m) => m.stage));
  const milestoneMap = new Map(milestones.map((m) => [m.stage, m]));

  // Find the last completed index to determine "active"
  let lastCompletedIdx = -1;
  MILESTONE_ORDER.forEach((stage, i) => {
    if (completedStages.has(stage)) lastCompletedIdx = i;
  });
  const activeIdx = lastCompletedIdx + 1;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-center text-4xl font-bold text-silver">VIN Status Tracking</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Enter your 17-character VIN to view shipment status milestones as recorded by GESOD RIDES.
        </p>

        {/* Important notice */}
        <div className="mt-8 flex gap-3 rounded-xl border border-border bg-card/60 p-5">
          <Info size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-silver">Status-Based Tracking:</span> This service
              displays milestone updates as recorded by our operations team. It does not provide
              GPS-based location tracking.
            </p>
            <p>
              Updates are provided by GESOD RIDES based on information received from our logistics
              partners. Timelines shown are indicative and may be affected by customs, weather, port
              congestion, or other external factors beyond our control.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase().slice(0, 17))}
                  maxLength={17}
                  placeholder="ENTER VIN (E.G., 1HGBH41JXMN109186)"
                  className="auth-input pl-10 font-mono tracking-wide uppercase"
                />
              </div>
              <Button variant="copper" type="submit" disabled={loading} className="sm:px-8">
                <Search size={18} />
                Track Vehicle
              </Button>
            </div>
            <p className="mt-2 text-right text-sm text-muted-foreground">
              {vin.length}/17 characters
            </p>
            {rateLimited && (
              <p className="mt-3 text-sm text-destructive">
                Too many searches. Please try again later.
              </p>
            )}
          </div>
        </form>


        {searched && !loading && (
          <div className="mt-8">
            {vehicle ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-1">
                  <h3 className="text-lg font-bold text-silver">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    VIN: {vehicle.vin ? maskVin(vehicle.vin) : "N/A"}
                  </p>
                </div>

                {/* Timeline */}
                <div className="mt-8 space-y-0">
                  {MILESTONE_ORDER.map((stage, i) => {
                    const data = milestoneMap.get(stage);
                    const isCompleted = completedStages.has(stage);
                    const isActive = i === activeIdx && activeIdx < MILESTONE_ORDER.length;
                    const isPending = !isCompleted && !isActive;
                    const isLast = i === MILESTONE_ORDER.length - 1;

                    return (
                      <div key={stage} className="flex gap-4">
                        {/* Dot + line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`relative mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
                              isCompleted
                                ? "border-primary bg-primary"
                                : isActive
                                ? "border-accent bg-accent"
                                : "border-border bg-transparent"
                            }`}
                          >
                            {isActive && (
                              <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-50" />
                            )}
                          </div>
                          {!isLast && (
                            <div className="w-px flex-1 min-h-[24px] bg-border" />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`pb-5 ${isPending ? "opacity-50" : ""}`}>
                          <p className="text-sm font-semibold text-silver">{stage}</p>
                          {data && (
                            <>
                              {data.notes && (
                                <p className="mt-0.5 text-xs text-muted-foreground">{data.notes}</p>
                              )}
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {new Date(data.created_at).toLocaleDateString()}
                              </p>
                              {data.evidence_url && (
                                <img
                                  src={data.evidence_url}
                                  alt={`${stage} evidence`}
                                  className="mt-2 h-20 w-28 rounded-lg object-cover border border-border"
                                  loading="lazy"
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="text-muted-foreground">
                  No vehicle found for this VIN. Please contact GESOD RIDES.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default Track;
