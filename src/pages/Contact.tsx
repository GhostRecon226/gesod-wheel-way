import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicLayout from "@/components/PublicLayout";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder — no backend action yet
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you shortly.");
      setForm({ name: "", email: "", phone: "", message: "" });
      setLoading(false);
    }, 800);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl text-silver">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">
          Have a question? Fill out the form and we'll respond within 24 hours. Need pricing?{" "}
          <Link to="/quote" className="text-gold hover:underline">Request a quote</Link>.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Full Name</label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              className="auth-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Email</label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="auth-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Phone</label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+234..."
              className="auth-input"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Message</label>
            <textarea
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us what you need..."
              rows={5}
              className="auth-input w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <Button variant="copper" type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </PublicLayout>
  );
};

export default Contact;
