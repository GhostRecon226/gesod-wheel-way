import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { uploadVehicleDocument, openDocument } from "@/lib/documentStorage";
import { Loader } from "@/components/Spinner";
import FieldError from "@/components/FieldError";

interface DocRow {
  id: string;
  type: string | null;
  file_url: string | null;
  created_at: string;
  vehicle_id: string;
  review_status: string;
  review_notes: string | null;
}

interface VehicleRef { id: string; vin: string | null; make: string | null; model: string | null; year: number | null; }

const DOC_TYPES = ["Bill of Sale", "Title", "Government ID", "Proof of Payment", "Customs Document", "Other"];

const statusCls: Record<string, string> = {
  pending: "badge-copper",
  approved: "badge-arrived",
  rejected: "inline-block rounded-full px-3 py-1 text-xs font-semibold bg-destructive text-primary-foreground",
};

const maskVin = (vin: string | null) =>
  !vin ? "-" : vin.length <= 8 ? vin : `${vin.slice(0, 4)}••••••${vin.slice(-4)}`;

const CustomerDocuments = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleId, setVehicleId] = useState("");
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<{ vehicle?: string; file?: string }>({});

  const fetchData = async () => {
    // RLS restricts both queries to the signed-in customer's own records
    const [d, v] = await Promise.all([
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
      supabase.from("vehicles").select("id, vin, make, model, year"),
    ]);
    setDocs((d.data ?? []) as DocRow[]);
    setVehicles(v.data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { vehicle?: string; file?: string } = {};
    if (!vehicleId) nextErrors.vehicle = "Please select a vehicle.";
    if (!file) nextErrors.file = "Please choose a file to upload.";
    setUploadErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!user || !file) return;
    setUploading(true);
    const { path, error: upErr } = await uploadVehicleDocument(user.id, vehicleId, file);
    if (upErr) {
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { error } = await (supabase as any).from("documents").insert({
      vehicle_id: vehicleId, type: docType, file_url: path,
      uploaded_by: user.id, review_status: "pending",
    });
    setUploading(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Document submitted", description: "Our team will review it shortly." });
      setFile(null); setVehicleId("");
      fetchData();
    }
  };


  const viewDoc = async (fileUrl: string) => {
    const url = await openDocument(fileUrl);
    if (!url) { toast({ title: "Unable to open document", description: "The file link could not be verified.", variant: "destructive" }); return; }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const vehicleLabel = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    if (!v) return "-";
    return `${[v.year, v.make, v.model].filter(Boolean).join(" ") || "Vehicle"} · ${maskVin(v.vin)}`;
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <form onSubmit={handleUpload} noValidate className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-1 flex items-center gap-2 font-semibold text-silver">
          <Upload size={16} className="text-primary" /> Upload a Document
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Attach documents to one of your vehicles. Every upload is reviewed by our team before it is accepted.
        </p>

        {vehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No vehicles linked to your account yet. Contact GESOD RIDES to get started.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <select
                value={vehicleId}
                onChange={(e) => { setVehicleId(e.target.value); setUploadErrors((p) => ({ ...p, vehicle: "" })); }}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
              >
                <option value="">Select vehicle…</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{vehicleLabel(v.id)}</option>)}
              </select>
              <FieldError message={uploadErrors.vehicle} />
            </div>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="h-10 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
            >
              {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div>
              <Input type="file" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUploadErrors((p) => ({ ...p, file: "" })); }} className="auth-input" />
              <FieldError message={uploadErrors.file} />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" variant="copper" disabled={uploading}>
                {uploading ? "Uploading…" : "Submit for Review"}
              </Button>
            </div>
          </div>
        )}
      </form>

      {docs.length === 0 ? (
        <p className="text-muted-foreground">No documents uploaded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-left text-muted-foreground">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Review Status</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d, i) => (
                <tr key={d.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                  <td className="px-4 py-3 text-silver">{d.type ?? "Document"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{vehicleLabel(d.vehicle_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={statusCls[d.review_status ?? "pending"] ?? "badge-copper"}>{d.review_status ?? "pending"}</span>
                  </td>
                  <td className="max-w-[200px] px-4 py-3 text-muted-foreground">{d.review_notes ?? "-"}</td>
                  <td className="px-4 py-3">
                    {d.file_url ? (
                      <button type="button" onClick={() => viewDoc(d.file_url!)} className="rounded-md border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10">
                        View / Download
                      </button>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerDocuments;
