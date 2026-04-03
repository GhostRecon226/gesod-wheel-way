import PublicLayout from "@/components/PublicLayout";

const Privacy = () => (
  <PublicLayout>
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-silver">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl text-silver">Information We Collect</h2>
          <p className="mt-2 text-muted-foreground">We collect personal information you provide during registration, including your name, email, phone number, and payment details necessary to process your vehicle import orders.</p>
        </section>
        <section>
          <h2 className="text-xl text-silver">How We Use Your Information</h2>
          <p className="mt-2 text-muted-foreground">Your data is used to process orders, communicate status updates, provide customer support, and improve our services. We do not sell your personal data to third parties.</p>
        </section>
        <section>
          <h2 className="text-xl text-silver">Data Security</h2>
          <p className="mt-2 text-muted-foreground">We implement industry-standard security measures to protect your data. All sensitive information is encrypted in transit and at rest.</p>
        </section>
        <section>
          <h2 className="text-xl text-silver">Your Rights</h2>
          <p className="mt-2 text-muted-foreground">You may request access to, correction of, or deletion of your personal data by contacting us through the contact form or support email.</p>
        </section>
      </div>
    </div>
  </PublicLayout>
);

export default Privacy;
