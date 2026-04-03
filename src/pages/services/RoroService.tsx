import { Ship, MapPin, Clock } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RoroService = () => (
  <PublicLayout>
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl text-silver">RORO Ocean Shipping</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Roll-On/Roll-Off ocean freight from US ports to Nigeria — the safest and most affordable way to ship vehicles.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <Ship className="mx-auto text-copper" size={32} />
          <h3 className="mt-3 text-silver">What is RORO?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Vehicles are driven directly onto the vessel and secured for transit. No container needed.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <MapPin className="mx-auto text-copper" size={32} />
          <h3 className="mt-3 text-silver">Routes</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            US departure ports: New Jersey, Savannah, Houston, Baltimore. Nigeria: Apapa, Tin Can, Onne.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <Clock className="mx-auto text-copper" size={32} />
          <h3 className="mt-3 text-silver">Transit Time</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Average transit is 4–6 weeks depending on the route and vessel schedule.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg text-silver">What's Included</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-4">
          <li>Port handling and loading at US departure port</li>
          <li>Ocean freight to selected Nigerian port</li>
          <li>Bill of lading issuance</li>
          <li>Real-time vessel tracking via sailing schedule</li>
          <li>Marine insurance (optional, recommended)</li>
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link to="/schedule">
          <Button variant="copper-outline" size="lg">View Schedule</Button>
        </Link>
        <Link to="/contact">
          <Button variant="copper" size="lg">Get Shipping Quote</Button>
        </Link>
      </div>
    </div>
  </PublicLayout>
);

export default RoroService;
