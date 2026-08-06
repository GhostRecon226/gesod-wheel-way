import { useEffect, useState } from "react";
import { CalendarClock, Gavel, Timer } from "lucide-react";
import {
  formatAuctionDate,
  getAuctionTiming,
  getCountdownParts,
} from "@/lib/auctionTime";

interface AuctionCountdownProps {
  auctionDate: string | null;
  /** "chip" for listing cards, "panel" for the detail page. */
  variant?: "chip" | "panel";
}

const pad = (n: number) => String(n).padStart(2, "0");

const AuctionCountdown = ({ auctionDate, variant = "chip" }: AuctionCountdownProps) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timing = getAuctionTiming(auctionDate, now);
  const parts = getCountdownParts(auctionDate, now);
  const dateLabel = formatAuctionDate(auctionDate);

  const tone =
    timing.phase === "today"
      ? "border-gold text-gold"
      : timing.phase === "closed"
        ? "border-border text-muted-foreground"
        : timing.days <= 3
          ? "border-gold text-gold"
          : "border-copper text-copper";

  const Icon = timing.phase === "today" ? Gavel : timing.phase === "closed" ? CalendarClock : Timer;

  if (variant === "chip") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border bg-surface-2 px-2.5 py-1 text-xs ${tone}`}
      >
        <Icon size={12} />
        {timing.phase === "scheduled" && parts
          ? `Opens in ${parts.days}d ${pad(parts.hours)}h ${pad(parts.minutes)}m`
          : timing.label}
      </span>
    );
  }

  return (
    <div className={`rounded-xl border bg-card p-5 ${tone.replace(/text-\S+/, "")}`}>
      <div className="flex items-center gap-2">
        <Icon size={18} className={tone.replace(/border-\S+/, "")} />
        <h2 className="text-lg text-silver">{timing.label}</h2>
      </div>

      {timing.phase === "scheduled" && parts && (
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            { v: parts.days, l: "Days" },
            { v: parts.hours, l: "Hours" },
            { v: parts.minutes, l: "Mins" },
            { v: parts.seconds, l: "Secs" },
          ].map((b) => (
            <div key={b.l} className="rounded-lg border border-border bg-surface-2 py-3">
              <div className="text-2xl text-silver tabular-nums">{pad(b.v)}</div>
              <div className="text-xs text-muted-foreground">{b.l}</div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-sm text-muted-foreground">
        {dateLabel ? `Auction date: ${dateLabel}` : "Auction date to be announced"}
        {timing.phase !== "closed" && dateLabel
          ? ". Bid requests must be submitted before this date."
          : ""}
      </p>
    </div>
  );
};

export default AuctionCountdown;
