import { loadStatusMeta } from "@/lib/loads";

const LoadStatusBadge = ({ status }: { status: string | null }) => {
  const meta = loadStatusMeta(status);
  return (
    <span
      className="inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.label}
    </span>
  );
};

export default LoadStatusBadge;
