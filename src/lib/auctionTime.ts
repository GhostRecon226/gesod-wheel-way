export type AuctionPhase = "scheduled" | "today" | "closed" | "unknown";

export interface AuctionTiming {
  phase: AuctionPhase;
  /** Whole days until the auction date (0 = today, negative = past). */
  days: number;
  label: string;
}

const DAY = 86400000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Parse a `YYYY-MM-DD` auction date as a local calendar day. */
export function parseAuctionDate(date: string | null | undefined): Date | null {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function getAuctionTiming(
  date: string | null | undefined,
  now: Date = new Date(),
): AuctionTiming {
  const target = parseAuctionDate(date);
  if (!target) return { phase: "unknown", days: 0, label: "Auction date to be announced" };

  const days = Math.round((startOfDay(target) - startOfDay(now)) / DAY);

  if (days > 0) {
    return {
      phase: "scheduled",
      days,
      label: days === 1 ? "Bidding opens tomorrow" : `Bidding opens in ${days} days`,
    };
  }
  if (days === 0) return { phase: "today", days, label: "Bidding today" };
  return {
    phase: "closed",
    days,
    label: days === -1 ? "Bidding closed yesterday" : `Bidding closed ${Math.abs(days)} days ago`,
  };
}

/** Time remaining until the auction day begins, broken into parts. */
export function getCountdownParts(date: string | null | undefined, now: Date = new Date()) {
  const target = parseAuctionDate(date);
  if (!target) return null;
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function formatAuctionDate(date: string | null | undefined) {
  const target = parseAuctionDate(date);
  if (!target) return null;
  return target.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
