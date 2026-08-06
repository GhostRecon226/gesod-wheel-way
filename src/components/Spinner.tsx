interface SpinnerProps {
  size?: number;
  className?: string;
}

/** Copper (#C47B2B) brand spinner used for all data fetch operations. */
export const Spinner = ({ size = 20, className = "" }: SpinnerProps) => (
  <span
    role="status"
    aria-label="Loading"
    className={`inline-block animate-spin rounded-full border-2 border-primary/25 border-t-primary ${className}`}
    style={{ width: size, height: size }}
  />
);

interface LoaderProps {
  label?: string;
  className?: string;
}

/** Centered spinner + label block for section-level loading states. */
export const Loader = ({ label = "Loading...", className = "" }: LoaderProps) => (
  <div className={`flex items-center justify-center gap-3 py-10 ${className}`}>
    <Spinner size={22} />
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

export default Loader;
