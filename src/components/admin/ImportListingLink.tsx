import { useState } from "react";
import { Link2, ClipboardPaste, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { toast } from "sonner";

export interface ImportDraft {
  fields: Record<string, unknown>;
  images: string[];
  imagesFailed: number;
  missing: string[];
}

interface Props {
  onDraft: (draft: ImportDraft) => void;
}

const ImportListingLink = ({ onDraft }: Props) => {
  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runImport = async (body: { url?: string; pastedText?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "import-auction-listing",
        { body }
      );

      if (fnError) {
        let message = fnError.message;
        let fallback: string | undefined;
        if (fnError instanceof FunctionsHttpError) {
          const payload = await fnError.context.json().catch(() => null);
          if (payload?.error) message = payload.error;
          fallback = payload?.fallback;
        }
        setError(message);
        if (fallback === "paste" && !body.pastedText) setShowPaste(true);
        return;
      }

      const draft = data as ImportDraft;
      onDraft(draft);
      const found = 23 - (draft.missing?.length ?? 0);
      toast.success(
        `Imported ${found} field(s) and ${draft.images?.length ?? 0} photo(s). Review before saving.`
      );
      setShowPaste(false);
      setPastedText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <Link2 size={16} className="text-copper" />
        <h3 className="text-sm font-semibold text-silver">Import from auction link</h3>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Paste a Copart or IAAI vehicle URL. Details and photos are pulled in and the listing
        form opens pre-filled for review. Nothing is published until you save.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.copart.com/lot/12345678"
          className="auth-input flex-1"
        />
        <Button
          variant="copper"
          disabled={loading || url.trim().length < 8}
          onClick={() => runImport({ url: url.trim() })}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
          {loading ? "Importing..." : "Import"}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowPaste((v) => !v)}
        className="mt-3 flex items-center gap-2 text-xs text-copper underline-offset-2 hover:underline"
      >
        <ClipboardPaste size={14} />
        {showPaste ? "Hide paste option" : "Link blocked? Paste page details instead"}
      </button>

      {showPaste && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-muted-foreground">
            Open the auction page, select all (Ctrl/Cmd + A), copy, and paste here. Image URLs
            included in the paste are imported too.
          </p>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={6}
            className="auth-input w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Paste the copied auction page content..."
          />
          <Button
            variant="copper"
            className="mt-2"
            disabled={loading || pastedText.trim().length < 40}
            onClick={() => runImport({ pastedText: pastedText.trim() })}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Extracting..." : "Extract from pasted text"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImportListingLink;
