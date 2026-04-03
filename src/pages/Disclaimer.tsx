import PublicLayout from "@/components/PublicLayout";

const Disclaimer = () => (
  <PublicLayout>
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-silver">Disclaimer</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl text-silver">Third-Party Auction Listings</h2>
          <p className="mt-2 text-muted-foreground">GESOD RIDES does not own the vehicles displayed on our platform. All listings are sourced from third-party auction platforms such as Copart and IAAI. Vehicle conditions, descriptions, and images are provided by these platforms and may not be fully accurate.</p>
        </section>
        <section>
          <h2 className="text-xl text-silver">No Warranty</h2>
          <p className="mt-2 text-muted-foreground">All vehicles purchased through auctions are sold as-is with no warranty expressed or implied. GESOD RIDES does not guarantee the mechanical condition, title status, or history of any vehicle.</p>
        </section>
        <section>
          <h2 className="text-xl text-silver">Shipping & Customs</h2>
          <p className="mt-2 text-muted-foreground">Shipping timelines and customs duty estimates are approximations. Actual times and costs may vary due to port congestion, vessel changes, regulatory updates, or other factors beyond our control.</p>
        </section>
        <section>
          <h2 className="text-xl text-silver">Financial Responsibility</h2>
          <p className="mt-2 text-muted-foreground">Customers are responsible for all applicable duties, taxes, and fees. GESOD RIDES facilitates the process but is not liable for any financial losses arising from exchange rate fluctuations, regulatory changes, or auction outcomes.</p>
        </section>
      </div>
    </div>
  </PublicLayout>
);

export default Disclaimer;
