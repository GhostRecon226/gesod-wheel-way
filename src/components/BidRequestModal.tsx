import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import FieldError from "@/components/FieldError";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BidRequestModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
}

const BidRequestModal = ({ open, onClose, listingId, listingTitle }: BidRequestModalProps) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    max_bid: "",
    agreed: false,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; max_bid?: string; agreed?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const maxBid = parseFloat(form.max_bid);
    const nextErrors: { name?: string; email?: string; max_bid?: string; agreed?: string } = {};
    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (!form.email.trim()) nextErrors.email = "Email address is required.";
    if (!form.max_bid.trim()) nextErrors.max_bid = "Maximum bid is required.";
    else if (isNaN(maxBid) || maxBid <= 0) nextErrors.max_bid = "Enter a valid bid amount.";
    if (!form.agreed) nextErrors.agreed = "You must agree to the auction terms.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);

    // If user is logged in, use their ID; otherwise we need them to log in
    if (!user) {
      toast.error("Please log in or sign up to submit a bid request.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("bid_requests").insert({
      customer_id: user.id,
      max_bid: maxBid,
      status: "pending" as const,
      deposit_status: "unpaid",
      admin_notes: `Name: ${form.name.trim()}, Email: ${form.email.trim()}, Phone: ${form.phone.trim()}, Listing: ${listingTitle}`,
    });

    if (error) {
      toast.error("Failed to submit bid request: " + error.message);
    } else {
      toast.success("Bid request submitted! We'll be in touch.");
      setForm({ name: "", email: "", phone: "", max_bid: "", agreed: false });
      onClose();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-silver">Request a Bid</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {listingTitle}
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Full Name *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              className="auth-input"
              maxLength={100}
              aria-invalid={!!errors.name}
            />
            <FieldError message={errors.name} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Email *</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="auth-input"
              maxLength={255}
              aria-invalid={!!errors.email}
            />
            <FieldError message={errors.email} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Phone</label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+234..."
              className="auth-input"
              maxLength={20}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Maximum Bid (USD) *</label>
            <Input
              type="number"
              min={1}
              step="0.01"
              value={form.max_bid}
              onChange={(e) => setForm({ ...form, max_bid: e.target.value })}
              placeholder="5000"
              className="auth-input"
              aria-invalid={!!errors.max_bid}
            />
            <FieldError message={errors.max_bid} />
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="agree-terms"
              checked={form.agreed}
              onCheckedChange={(v) => setForm({ ...form, agreed: v === true })}
              className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label htmlFor="agree-terms" className="text-xs text-muted-foreground leading-snug">
              I agree to the auction terms and understand that winning bids are binding.
              Vehicles are sold as-is with no warranty.
            </label>
          </div>
          <FieldError message={errors.agreed} />

          <Button variant="copper" type="submit" disabled={saving} className="w-full">
            {saving ? "Submitting..." : "Submit Bid Request"}
          </Button>

          {!user && (
            <p className="text-center text-xs text-gold">
              You must be logged in to submit a bid request.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BidRequestModal;
