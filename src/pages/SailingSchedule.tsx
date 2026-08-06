import { useEffect, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

interface Schedule {
  id: string;
  vessel_name: string;
  departure_port: string | null;
  etd: string | null;
  eta_nigeria: string | null;
  destination_port: string | null;
  status: string;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    scheduled: "badge-scheduled",
    departed: "badge-departed",
    arrived: "badge-arrived",
  };
  return map[status] ?? "badge-scheduled";
};

const SailingSchedule = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("sailing_schedules")
        .select("*")
        .order("etd", { ascending: true });
      setSchedules((data as Schedule[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl text-silver">Sailing Schedule</h1>
        <p className="mt-2 text-muted-foreground">
          Upcoming and recent vessel departures to Nigeria.
        </p>

        {loading ? (
          <p className="mt-12 text-center text-muted-foreground">Loading...</p>
        ) : schedules.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">No schedules available yet.</p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-4 py-3 font-semibold text-silver">Vessel</th>
                  <th className="px-4 py-3 font-semibold text-silver">Departure Port</th>
                  <th className="px-4 py-3 font-semibold text-silver">ETD</th>
                  <th className="px-4 py-3 font-semibold text-silver">ETA Nigeria</th>
                  <th className="px-4 py-3 font-semibold text-silver">Destination</th>
                  <th className="px-4 py-3 font-semibold text-silver">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s, i) => (
                  <tr
                    key={s.id}
                    className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}
                  >
                    <td className="px-4 py-3 text-foreground">{s.vessel_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.departure_port ?? "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.etd ?? "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.eta_nigeria ?? "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.destination_port ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className={statusBadge(s.status)}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default SailingSchedule;
