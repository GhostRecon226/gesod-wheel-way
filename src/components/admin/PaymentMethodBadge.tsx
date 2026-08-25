import { paymentMethodMeta } from "@/lib/drivers";

const PaymentMethodBadge = ({ method }: { method: string | null }) => {
  const meta = paymentMethodMeta(method);
  return (
    <span
      className="inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.label}
    </span>
  );
};

export default PaymentMethodBadge;
