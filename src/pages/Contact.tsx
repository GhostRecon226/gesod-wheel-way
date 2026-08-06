import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicLayout from "@/components/PublicLayout";
import { toast } from "sonner";
import FieldError from "@/components/FieldError";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: { name?: string; email?: string; message?: string } = {};
    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (!form.email.trim()) nextErrors.email = "Email address is required.";
    if (!form.message.trim()) nextErrors.message = "Please tell us how we can help.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    // Placeholder: no backend action yet
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

        <div className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-semibold text-silver">Email</h2>
            <a
              href="mailto:contact@gesodrides.com"
              className="mt-1 block text-sm text-muted-foreground no-underline hover:text-gold"
            >
              contact@gesodrides.com
            </a>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-silver">Phone</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              +1 (302) 293-7210
              <br />
              +234 809 394 3763
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-silver">Office Hours</h2>
            <p className="mt-1 text-sm text-muted-foreground">Mon-Fri: 9:00 AM - 6:00 PM EST</p>
          </div>
        </div>


        <form onSubmit={handleSubmit} noValidate className="mt-8 rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Full Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              className="auth-input"
              aria-invalid={!!errors.name}
            />
            <FieldError message={errors.name} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="auth-input"
              aria-invalid={!!errors.email}
            />
            <FieldError message={errors.email} />
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
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us what you need..."
              rows={5}
              className="auth-input w-full rounded-md border px-3 py-2 text-sm"
              aria-invalid={!!errors.message}
            />
            <FieldError message={errors.message} />
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
