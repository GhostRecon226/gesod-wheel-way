import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicLayout from "@/components/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

interface Milestone {
  id: string;
  stage: string;
  notes: string | null;
  created_at: string;
}

const Track = () => {
  const [vin, setVin] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vin.trim()) return;
    setLoading(true);
    setSearched(true);

    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("id, make, model, year, status")
      .eq("vin", vin.trim().toUpperCase())
      .maybeSingle();

    if (!vehicle) {
      setVehicleInfo(null);
      setMilestones([]);
      setLoading(false);
      return;
    }

    setVehicleInfo(`${vehicle.year} ${vehicle.make} ${vehicle.model} — ${vehicle.status ?? "In Progress"}`);

    const { data: ms } = await supabase
      .from("vehicle_milestones")
      .select("id, stage, notes, created_at")
      .eq("vehicle_id", vehicle.id)
      .order("created_at", { ascending: true });

    setMilestones((ms as Milestone[]) ?? []);
    setLoading(false);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-center text-3xl text-silver">Track Your Vehicle</h1>
        <p className="mt-2 text-center text-muted-foreground">
          Enter your VIN to see the latest status and milestones.
        </p>

        <form onSubmit={handleSearch} className="mt-8">
          <div className="rounded-xl border border-border bg-card p-6">
            <label className="mb-2 block text-sm text-muted-foreground">
              Vehicle Identification Number (VIN)
            </label>
            <div className="flex gap-3">
              <Input
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                placeholder="e.g. 1HGBH41JXMN109186"
                className="auth-input flex-1"
              />
              <Button variant="copper" type="submit" disabled={loading}>
                <Search size={18} />
                Search
              </Button>
            </div>
          </div>
        </form>

        {searched && !loading && (
          <div className="mt-8">
            {vehicleInfo ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg text-silver">{vehicleInfo}</h3>
                {milestones.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {milestones.map((m, i) => (
                      <div key={m.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                            {i + 1}
                          </div>
                          {i < milestones.length - 1 && (
                            <div className="w-px flex-1 bg-border" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="font-semibold text-silver">{m.stage}</p>
                          {m.notes && <p className="mt-1 text-sm text-muted-foreground">{m.notes}</p>}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(m.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No milestones recorded yet.</p>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No vehicle found with that VIN. Please check and try again.
              </p>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default Track;
