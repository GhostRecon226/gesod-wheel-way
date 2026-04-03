import PublicLayout from "@/components/PublicLayout";

const Terms = () => (
  <PublicLayout>
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-silver">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2026</p>

      <div className="mt-8 space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="text-xl text-silver">1. Acceptance of Terms</h2>
          <p className="mt-2 text-muted-foreground">By using GESOD RIDES services, you agree to these terms. If you do not agree, please do not use our platform.</p>
        </section>
        <section>
          <h2 className="text-xl text-silver">2. Services</h2>
          <p className="mt-2 text-muted-foreground">GESOD RIDES provides vehicle sourcing, auction bidding, ocean freight, inland towing, customs clearance facilitation, and logistics coordination services.</p>
        </section>
        <section>
          <h2 className="text-xl text-silver">3. Payment Terms</h2>
          <p className="mt-2 text-muted-foreground">All payments must be made in full at each stage before proceeding to the next. Payments are non-refundable once services have been rendered.</p>
        </section>
        <section>
          <h2 className="text-xl text-silver">4. Limitation of Liability</h2>
          <p className="mt-2 text-muted-foreground">GESOD RIDES acts as a logistics facilitator. We are not liable for auction vehicle conditions, customs delays, or third-party failures beyond our control.</p>
        </section>
        <section>
          <h2 className="text-xl text-silver">5. Dispute Resolution</h2>
          <p className="mt-2 text-muted-foreground">Disputes shall be resolved through our internal dispute system first. Unresolved matters may be escalated through arbitration under Nigerian law.</p>
        </section>
      </div>
    </div>
  </PublicLayout>
);

export default Terms;
