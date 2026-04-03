import { Truck, MapPin, DollarSign } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TowingService = () => (
  <PublicLayout>
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl text-silver">Inland Towing</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        We transport your purchased vehicle from the auction yard to the nearest US departure port.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <Truck className="mx-auto text-copper" size={32} />
          <h3 className="mt-3 text-silver">Pickup</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We arrange flatbed or drive-away pickup from any Copart or IAAI yard in the US.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <MapPin className="mx-auto text-copper" size={32} />
          <h3 className="mt-3 text-silver">Delivery to Port</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Vehicle is transported to the assigned departure port for RORO loading.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <DollarSign className="mx-auto text-copper" size={32} />
          <h3 className="mt-3 text-silver">Pricing</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Rates vary by distance. Typical range: $150–$600 depending on yard-to-port distance.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg text-silver">Important Notes</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-4">
          <li>Non-running vehicles require flatbed transport (additional fees may apply)</li>
          <li>Pickup is scheduled within 3–5 business days of payment</li>
          <li>Storage fees at the auction yard are the customer's responsibility until pickup</li>
          <li>We provide tracking updates during inland transit</li>
        </ul>
      </div>

      <div className="mt-10 text-center">
        <Link to="/contact">
          <Button variant="copper" size="lg">Get Towing Quote</Button>
        </Link>
      </div>
    </div>
  </PublicLayout>
);

export default TowingService;
