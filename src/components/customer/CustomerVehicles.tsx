import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { openDocument } from "@/lib/documentStorage";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";
import { Loader } from "@/components/Spinner";

interface Vehicle {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  status: string | null;
}

interface Milestone {
  id: string;
  stage: string;
  notes: string | null;
  created_at: string;
  evidence_url: string | null;
}

interface Doc {
  id: string;
  type: string | null;
  file_url: string | null;
  created_at: string;
}

function maskVin(vin: string) {
  if (vin.length <= 8) return vin;
  return vin.slice(0, 4) + "*".repeat(vin.length - 8) + vin.slice(-4);
}

function statusBadge(status: string | null) {
  const s = (status ?? "").toLowerCase();
  let cls = "badge-copper";
  if (s.includes("deliver") || s.includes("arrived") || s.includes("confirmed") || s.includes("released"))
    cls = "badge-arrived";
  else if (s.includes("transit") || s.includes("depart") || s.includes("towing"))
    cls = "badge-departed";
  return <span className={cls}>{status ?? "Pending"}</span>;
}

const MILESTONE_ORDER = [
  "Bid Requested","Bid Placed","Bid Won","Awaiting Payment","Payment Confirmed",
  "Towing to US Port","At US Port","Vessel Assigned","Vessel Departed","In Transit",
  "Vessel Arrived","Customs Documentation in Progress","Customs Duty Paid",
  "Vehicle Released from Port","Out for Delivery","Delivered to Customer",
];

const CustomerVehicles = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  const viewDoc = async (fileUrl: string) => {
    const url = await openDocument(fileUrl);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("vehicles")
      .select("id, make, model, year, vin, status")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setVehicles(data ?? []); setLoading(false); });
  }, [user]);

  const openDetail = async (v: Vehicle) => {
    setSelected(v);
    const [{ data: ms }, { data: d }] = await Promise.all([
      supabase.from("vehicle_milestones").select("id, stage, notes, created_at, evidence_url").eq("vehicle_id", v.id).order("created_at", { ascending: true }),
      supabase.from("documents").select("id, type, file_url, created_at").eq("vehicle_id", v.id).order("created_at", { ascending: false }),
    ]);
    setMilestones((ms as Milestone[]) ?? []);
    setDocs((d as Doc[]) ?? []);
  };

  if (loading) return <Loader />;

  if (selected) {
    const completedStages = new Set(milestones.map((m) => m.stage));
    const milestoneMap = new Map(milestones.map((m) => [m.stage, m]));
    let lastCompletedIdx = -1;
    MILESTONE_ORDER.forEach((s, i) => { if (completedStages.has(s)) lastCompletedIdx = i; });
    const activeIdx = lastCompletedIdx + 1;

    return (
      <div>
        <button onClick={() => setSelected(null)} className="mb-4 text-sm text-gold hover:underline">← Back to vehicles</button>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold text-silver">{selected.year} {selected.make} {selected.model}</h2>
          <p className="text-sm text-muted-foreground">VIN: {selected.vin ? maskVin(selected.vin) : "N/A"}</p>
          <div className="mt-2">{statusBadge(selected.status)}</div>

          <h3 className="mt-8 mb-4 text-lg font-bold text-silver">Milestone Timeline</h3>
          <div className="space-y-0">
            {MILESTONE_ORDER.map((stage, i) => {
              const data = milestoneMap.get(stage);
              const isCompleted = completedStages.has(stage);
              const isActive = i === activeIdx && activeIdx < MILESTONE_ORDER.length;
              const isPending = !isCompleted && !isActive;
              const isLast = i === MILESTONE_ORDER.length - 1;
              return (
                <div key={stage} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`relative mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${isCompleted ? "border-primary bg-primary" : isActive ? "border-accent bg-accent" : "border-border bg-transparent"}`}>
                      {isActive && <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-50" />}
                    </div>
                    {!isLast && <div className="w-px flex-1 min-h-[24px] bg-border" />}
                  </div>
                  <div className={`pb-5 ${isPending ? "opacity-50" : ""}`}>
                    <p className="text-sm font-semibold text-silver">{stage}</p>
                    {data && (
                      <>
                        {data.notes && <p className="mt-0.5 text-xs text-muted-foreground">{data.notes}</p>}
                        <p className="mt-0.5 text-xs text-muted-foreground">{new Date(data.created_at).toLocaleDateString()}</p>
                        {data.evidence_url && <img src={data.evidence_url} alt={stage} className="mt-2 h-20 w-28 rounded-lg object-cover border border-border" loading="lazy" />}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {docs.length > 0 && (
            <>
              <h3 className="mt-8 mb-4 text-lg font-bold text-silver">Documents</h3>
              <div className="space-y-2">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-2">
                    <div>
                      <p className="text-sm text-silver">{d.type ?? "Document"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                    </div>
                    {d.file_url && (
                      <button type="button" onClick={() => viewDoc(d.file_url!)} className="text-xs font-medium text-primary border border-primary rounded-md px-3 py-1 hover:bg-primary/10">
                        View
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (vehicles.length === 0)
    return <p className="text-muted-foreground">No vehicles linked to your account yet. Contact GESOD RIDES to get started.</p>;

  return (
    <div className="space-y-3">
      {vehicles.map((v) => (
        <button
          key={v.id}
          onClick={() => openDetail(v)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-surface-2"
        >
          <div>
            <p className="font-semibold text-silver">{v.year} {v.make} {v.model}</p>
            <p className="text-sm text-muted-foreground">VIN: {v.vin ? maskVin(v.vin) : "N/A"}</p>
          </div>
          <div className="flex items-center gap-3">
            {statusBadge(v.status)}
            <ChevronRight size={18} className="text-muted-foreground" />
          </div>
        </button>
      ))}
    </div>
  );
};

export default CustomerVehicles;
