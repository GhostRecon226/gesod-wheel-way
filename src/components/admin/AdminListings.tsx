import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader } from "@/components/Spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuctionListing } from "@/lib/listings";
import { resolveListingImages, uploadListingImage } from "@/lib/listingImages";

interface ListingRow extends AuctionListing {
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
  vin: "",
  title_type: "",
  odometer: "",
  primary_damage: "",
  secondary_damage: "",
  damage_description: "",
  run_and_drive: false,
  has_keys: false,
  estimated_value: "",
  body_style: "",
  engine: "",
  transmission: "",
  drivetrain: "",
  fuel_type: "",
  exterior_color: "",
  interior_color: "",
};

const AdminListings = () => {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingPreviews, setExistingPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const loadThumbs = useCallback(async (rows: ListingRow[]) => {
    const refs = rows.map((r) => r.images?.[0]).filter((r): r is string => Boolean(r));
    const urls = await resolveListingImages(refs);
    const map: Record<string, string> = {};
    let cursor = 0;
    rows.forEach((r) => {
      if (r.images?.[0]) {
        const url = urls[cursor++];
        if (url) map[r.id] = url;
      }
    });
    setThumbs(map);
  }, []);

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
      const { data: refreshed } = await supabase
        .from("auction_listings")
        .select("*")
        .order("created_at", { ascending: false });
      const next = (refreshed as ListingRow[]) ?? [];
      setListings(next);
      await loadThumbs(next);
    } else {
      setListings(rows);
      await loadThumbs(rows);
    }
    setLoading(false);
  }, [loadThumbs]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExistingImages([]);
    setExistingPreviews([]);
    setNewFiles([]);
    setDialogOpen(true);
  };

  const openEdit = async (row: ListingRow) => {
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
      vin: row.vin ?? "",
      title_type: row.title_type ?? "",
      odometer: row.odometer?.toString() ?? "",
      primary_damage: row.primary_damage ?? "",
      secondary_damage: row.secondary_damage ?? "",
      damage_description: row.damage_description ?? "",
      run_and_drive: row.run_and_drive ?? false,
      has_keys: row.has_keys ?? false,
      estimated_value: row.estimated_value?.toString() ?? "",
      body_style: row.body_style ?? "",
      engine: row.engine ?? "",
      transmission: row.transmission ?? "",
      drivetrain: row.drivetrain ?? "",
      fuel_type: row.fuel_type ?? "",
      exterior_color: row.exterior_color ?? "",
      interior_color: row.interior_color ?? "",
    });
    const refs = row.images ?? [];
    setExistingImages(refs);
    setExistingPreviews(await resolveListingImages(refs));
    setNewFiles([]);
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

  const removeExisting = (index: number) => {
    setExistingImages((refs) => refs.filter((_, i) => i !== index));
    setExistingPreviews((urls) => urls.filter((_, i) => i !== index));
  };

  const moveExisting = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= existingImages.length) return;
    const swap = <T,>(arr: T[]) => {
      const next = [...arr];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    };
    setExistingImages(swap);
    setExistingPreviews(swap);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let images = [...existingImages];

    for (const file of newFiles) {
      const { path, error: uploadErr } = await uploadListingImage(file);
      if (uploadErr) {
        toast.error("Image upload failed: " + uploadErr.message);
        setSaving(false);
        return;
      }
      images = [...images, path];
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
      vin: form.vin ? form.vin.trim().toUpperCase() : null,
      title_type: form.title_type || null,
      odometer: form.odometer ? parseInt(form.odometer) : null,
      primary_damage: form.primary_damage || null,
      secondary_damage: form.secondary_damage || null,
      damage_description: form.damage_description || null,
      run_and_drive: form.run_and_drive,
      has_keys: form.has_keys,
      estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
      body_style: form.body_style || null,
      engine: form.engine || null,
      transmission: form.transmission || null,
      drivetrain: form.drivetrain || null,
      fuel_type: form.fuel_type || null,
      exterior_color: form.exterior_color || null,
      interior_color: form.interior_color || null,
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

  const text = (
    key: keyof typeof emptyForm,
    label: string,
    placeholder = "",
    type = "text"
  ) => (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <Input
        type={type}
        value={String(form[key] ?? "")}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="auth-input"
        placeholder={placeholder}
      />
    </div>
  );

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
                    <div className="flex items-center gap-2">
                      {thumbs[row.id] ? (
                        <img
                          src={thumbs[row.id]}
                          alt=""
                          className="h-10 w-14 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded bg-surface-2">
                          <ImageIcon size={16} className="text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {row.images?.length ?? 0}
                      </span>
                    </div>
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
                      <Button variant="copper" size="sm" onClick={() => openEdit(row)}>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-silver">
              {editingId ? "Edit Listing" : "Create Listing"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="mt-4 space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-silver">Vehicle</h3>
              <div className="grid grid-cols-2 gap-4">
                {text("make", "Make", "Toyota")}
                {text("model", "Model", "Camry")}
                {text("year", "Year", "2022", "number")}
                {text("vin", "VIN", "1HGCM82633A004352")}
                {text("body_style", "Body Style", "Sedan")}
                {text("engine", "Engine", "2.5L 4 Cyl")}
                {text("transmission", "Transmission", "Automatic")}
                {text("drivetrain", "Drivetrain", "FWD")}
                {text("fuel_type", "Fuel Type", "Gasoline")}
                {text("exterior_color", "Exterior Colour", "Silver")}
                {text("interior_color", "Interior Colour", "Black")}
                {text("odometer", "Odometer (mi)", "68000", "number")}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-silver">Condition & Value</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Title Type</label>
                  <select
                    value={form.title_type}
                    onChange={(e) => setForm({ ...form, title_type: e.target.value })}
                    className="auth-input w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="">Not specified</option>
                    <option value="Clean">Clean</option>
                    <option value="Salvage">Salvage</option>
                    <option value="Rebuilt">Rebuilt</option>
                    <option value="Certificate of Destruction">Certificate of Destruction</option>
                  </select>
                </div>
                {text("estimated_value", "Estimated Retail Value (USD)", "14500", "number")}
                {text("primary_damage", "Primary Damage", "Front End")}
                {text("secondary_damage", "Secondary Damage", "Side")}
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-xs text-muted-foreground">
                  Damage Description
                </label>
                <textarea
                  value={form.damage_description}
                  onChange={(e) => setForm({ ...form, damage_description: e.target.value })}
                  rows={3}
                  className="auth-input w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Front bumper and hood damage, airbags intact, drives under own power."
                />
              </div>
              <div className="mt-4 flex gap-6">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={form.run_and_drive}
                    onChange={(e) => setForm({ ...form, run_and_drive: e.target.checked })}
                  />
                  Run and drive
                </label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={form.has_keys}
                    onChange={(e) => setForm({ ...form, has_keys: e.target.checked })}
                  />
                  Keys available
                </label>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-silver">Auction</h3>
              <div className="grid grid-cols-2 gap-4">
                {text("lot_number", "Lot Number", "12345678")}
                {text("auction_source", "Auction Source", "Copart")}
                {text("auction_date", "Auction Date", "", "date")}
                {text("yard_location", "Yard Location", "Dallas, TX")}
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
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-silver">Photos</h3>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-muted-foreground hover:border-copper">
                <Upload size={16} />
                {newFiles.length > 0 ? `${newFiles.length} new file(s) selected` : "Choose files..."}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
                />
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                The first photo is used as the cover image.
              </p>

              {existingPreviews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {existingPreviews.map((url, i) => (
                    <div key={url} className="relative">
                      <img
                        src={url}
                        alt=""
                        className="h-20 w-28 rounded-md border border-border object-cover"
                      />
                      <button
                        type="button"
                        aria-label="Remove photo"
                        onClick={() => removeExisting(i)}
                        className="absolute -right-2 -top-2 rounded-full bg-danger p-1 text-primary-foreground"
                      >
                        <X size={12} />
                      </button>
                      <div className="mt-1 flex justify-center gap-1">
                        <button
                          type="button"
                          aria-label="Move photo left"
                          onClick={() => moveExisting(i, -1)}
                          className="rounded border border-border px-2 text-xs text-muted-foreground"
                        >
                          {"<"}
                        </button>
                        <button
                          type="button"
                          aria-label="Move photo right"
                          onClick={() => moveExisting(i, 1)}
                          className="rounded border border-border px-2 text-xs text-muted-foreground"
                        >
                          {">"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {newFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {newFiles.map((file) => (
                    <div
                      key={file.name}
                      className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-muted-foreground"
                    >
                      {file.name}
                    </div>
                  ))}
                </div>
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
