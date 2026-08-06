import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
import { Loader } from "@/components/Spinner";
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ListingRow {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  images: string[] | null;
  lot_number: string | null;
  auction_source: string | null;
  auction_date: string | null;
  yard_location: string | null;
  status: "active" | "expired";
  created_at: string;
}

const emptyForm = {
  make: "",
  model: "",
  year: "",
  lot_number: "",
  auction_source: "",
  auction_date: "",
  yard_location: "",
  status: "active" as "active" | "expired",
};

const AdminListings = () => {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchListings = useCallback(async () => {
    const { data } = await supabase
      .from("auction_listings")
      .select("*")
      .order("created_at", { ascending: false });
    const rows = (data as ListingRow[]) ?? [];

    // Auto-expire past-date active listings
    const today = new Date().toISOString().split("T")[0];
    const toExpire = rows.filter(
      (r) => r.status === "active" && r.auction_date && r.auction_date < today
    );
    if (toExpire.length > 0) {
      await Promise.all(
        toExpire.map((r) =>
          supabase.from("auction_listings").update({ status: "expired" as const }).eq("id", r.id)
        )
      );
      // Re-fetch after expiry
      const { data: refreshed } = await supabase
        .from("auction_listings")
        .select("*")
        .order("created_at", { ascending: false });
      setListings((refreshed as ListingRow[]) ?? []);
    } else {
      setListings(rows);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExistingImages([]);
    setImageFile(null);
    setDialogOpen(true);
  };

  const openEdit = (row: ListingRow) => {
    setEditingId(row.id);
    setForm({
      make: row.make ?? "",
      model: row.model ?? "",
      year: row.year?.toString() ?? "",
      lot_number: row.lot_number ?? "",
      auction_source: row.auction_source ?? "",
      auction_date: row.auction_date ?? "",
      yard_location: row.yard_location ?? "",
      status: row.status,
    });
    setExistingImages(row.images ?? []);
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("auction_listings").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Listing deleted");
      fetchListings();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let images = existingImages;

    // Upload image if provided
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `listings/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("vehicle-documents")
        .upload(path, imageFile);
      if (uploadErr) {
        toast.error("Image upload failed: " + uploadErr.message);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("vehicle-documents")
        .getPublicUrl(path);
      images = [urlData.publicUrl, ...existingImages];
    }

    const payload = {
      make: form.make || null,
      model: form.model || null,
      year: form.year ? parseInt(form.year) : null,
      lot_number: form.lot_number || null,
      auction_source: form.auction_source || null,
      auction_date: form.auction_date || null,
      yard_location: form.yard_location || null,
      status: form.status as "active" | "expired",
      images,
    };

    if (editingId) {
      const { error } = await supabase
        .from("auction_listings")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        toast.error("Update failed: " + error.message);
      } else {
        toast.success("Listing updated");
      }
    } else {
      const { error } = await supabase.from("auction_listings").insert(payload);
      if (error) {
        toast.error("Create failed: " + error.message);
      } else {
        toast.success("Listing created");
      }
    }

    setSaving(false);
    setDialogOpen(false);
    fetchListings();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl text-silver">Auction Listings</h2>
        <Button variant="copper" onClick={openCreate}>
          <Plus size={16} /> Add Listing
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : listings.length === 0 ? (
        <p className="text-muted-foreground">No active listings at the moment. Check back soon.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-3 py-3 font-semibold text-silver">Image</th>
                <th className="px-3 py-3 font-semibold text-silver">Make</th>
                <th className="px-3 py-3 font-semibold text-silver">Model</th>
                <th className="px-3 py-3 font-semibold text-silver">Year</th>
                <th className="px-3 py-3 font-semibold text-silver">Lot #</th>
                <th className="px-3 py-3 font-semibold text-silver">Source</th>
                <th className="px-3 py-3 font-semibold text-silver">Auction Date</th>
                <th className="px-3 py-3 font-semibold text-silver">Status</th>
                <th className="px-3 py-3 font-semibold text-silver">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((row, i) => (
                <tr key={row.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                  <td className="px-3 py-2">
                    {row.images && row.images[0] ? (
                      <img
                        src={row.images[0]}
                        alt=""
                        className="h-10 w-14 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-14 items-center justify-center rounded bg-surface-2">
                        <ImageIcon size={16} className="text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-foreground">{row.make ?? "-"}</td>
                  <td className="px-3 py-2 text-foreground">{row.model ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.year ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.lot_number ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.auction_source ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.auction_date ?? "-"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground ${
                        row.status === "active" ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Button
                        variant="copper"
                        size="sm"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(row.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-silver">
              {editingId ? "Edit Listing" : "Create Listing"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Make</label>
                <Input
                  value={form.make}
                  onChange={(e) => setForm({ ...form, make: e.target.value })}
                  className="auth-input"
                  placeholder="Toyota"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Model</label>
                <Input
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="auth-input"
                  placeholder="Camry"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Year</label>
                <Input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="auth-input"
                  placeholder="2022"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Lot Number</label>
                <Input
                  value={form.lot_number}
                  onChange={(e) => setForm({ ...form, lot_number: e.target.value })}
                  className="auth-input"
                  placeholder="12345678"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Auction Source</label>
                <Input
                  value={form.auction_source}
                  onChange={(e) => setForm({ ...form, auction_source: e.target.value })}
                  className="auth-input"
                  placeholder="Copart"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Auction Date</label>
                <Input
                  type="date"
                  value={form.auction_date}
                  onChange={(e) => setForm({ ...form, auction_date: e.target.value })}
                  className="auth-input"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Yard Location</label>
                <Input
                  value={form.yard_location}
                  onChange={(e) => setForm({ ...form, yard_location: e.target.value })}
                  className="auth-input"
                  placeholder="Dallas, TX"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as "active" | "expired" })
                  }
                  className="auth-input w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Vehicle Image
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-muted-foreground hover:border-copper">
                <Upload size={16} />
                {imageFile ? imageFile.name : "Choose file..."}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {existingImages.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {existingImages.length} existing image(s)
                </p>
              )}
            </div>

            <Button variant="copper" type="submit" disabled={saving} className="w-full">
              {saving ? "Saving..." : editingId ? "Update Listing" : "Create Listing"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminListings;
