import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WatchButtonProps {
  watching: boolean;
  busy?: boolean;
  onToggle: () => void;
  size?: "sm" | "default";
  className?: string;
  fullWidth?: boolean;
}

/** Toggle for adding an auction listing to the user's watchlist. */
const WatchButton = ({
  watching,
  busy,
  onToggle,
  size = "sm",
  className = "",
  fullWidth,
}: WatchButtonProps) => (
  <Button
    type="button"
    variant={watching ? "copper-outline" : "outline"}
    size={size}
    disabled={busy}
    aria-pressed={watching}
    aria-label={watching ? "Remove from watchlist" : "Add to watchlist"}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    }}
    className={`${fullWidth ? "w-full" : ""} ${className}`}
  >
    {busy ? (
      <Loader2 size={14} className="mr-1.5 animate-spin" />
    ) : watching ? (
      <EyeOff size={14} className="mr-1.5" />
    ) : (
      <Eye size={14} className="mr-1.5" />
    )}
    {watching ? "Watching" : "Watch"}
  </Button>
);

export default WatchButton;
