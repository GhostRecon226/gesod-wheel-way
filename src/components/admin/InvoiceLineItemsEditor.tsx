import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { EXTRA_CHARGE_TYPES, lineItemTypeLabel, nextDraftKey, type LineItemDraft } from "@/lib/invoices";

interface LoadOption {
  id: string;
  vin: string;
  make: string | null;
  model: string | null;
}

interface Props {
  loads: LoadOption[];
  items: LineItemDraft[];
  onChange: (items: LineItemDraft[]) => void;
}

const loadLabel = (load: LoadOption | undefined) =>
  load ? `${load.vin} · ${[load.make, load.model].filter(Boolean).join(" ") || "Vehicle"}` : "Unknown load";

// Base price and service fee rows are tied 1:1 to a load and generated
// automatically; only their amount/description are editable. Extra charges
// are fully editable, including which load they apply to.
const isAutoRow = (type: string) => type === "base_price" || type === "service_fee";

const InvoiceLineItemsEditor = ({ loads, items, onChange }: Props) => {
  const loadById = new Map(loads.map((l) => [l.id, l]));

  const update = (key: string, patch: Partial<LineItemDraft>) => {
    onChange(items.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  };

  const remove = (key: string) => onChange(items.filter((it) => it.key !== key));

  const addExtraCharge = () => {
    onChange([
      ...items,
      {
        key: nextDraftKey(),
        load_id: loads[0]?.id ?? "",
        type: EXTRA_CHARGE_TYPES[0].value,
        description: "",
        amount: 0,
      },
    ]);
  };

  const total = items.reduce((sum, it) => sum + (Number.isFinite(it.amount) ? it.amount : 0), 0);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-muted-foreground">
              <th className="px-4 py-3">Load</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No line items yet.</td></tr>
            ) : (
              items.map((it, i) => {
                const auto = isAutoRow(it.type);
                return (
                  <tr key={it.key} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {auto ? (
                        loadLabel(loadById.get(it.load_id))
                      ) : (
                        <select
                          value={it.load_id}
                          onChange={(e) => update(it.key, { load_id: e.target.value })}
                          className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs text-foreground"
                        >
                          {loads.map((l) => <option key={l.id} value={l.id}>{loadLabel(l)}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-silver">
                      {auto ? (
                        lineItemTypeLabel(it.type)
                      ) : (
                        <select
                          value={it.type}
                          onChange={(e) => update(it.key, { type: e.target.value })}
                          className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs text-foreground"
                        >
                          {EXTRA_CHARGE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={it.description}
                        onChange={(e) => update(it.key, { description: e.target.value })}
                        placeholder="Description"
                        className="auth-input h-8 text-xs"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={it.amount}
                        onChange={(e) => update(it.key, { amount: parseFloat(e.target.value) || 0 })}
                        className="auth-input h-8 w-28 text-xs"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => remove(it.key)} className="text-muted-foreground hover:text-danger" aria-label="Remove line item">
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr className="border-t border-border bg-card">
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-silver">Total</td>
                <td className="px-4 py-3 text-sm font-semibold text-silver">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <Button
        variant="copper-outline"
        size="sm"
        type="button"
        className="mt-3"
        disabled={loads.length === 0}
        onClick={addExtraCharge}
      >
        Add Extra Charge
      </Button>
    </div>
  );
};

export default InvoiceLineItemsEditor;
