import { Link } from "react-router-dom";

interface LogoProps {
  /** Render as a link to the home page. */
  to?: string;
  className?: string;
}

/** GESOD RIDES wordmark used in the public navbar and both dashboards. */
const Logo = ({ to, className = "" }: LogoProps) => {
  const mark = (
    <span className={`text-lg font-bold tracking-tight ${className}`}>
      <span className="text-silver">GESOD</span> <span className="text-gold">RIDES</span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="no-underline" aria-label="GESOD RIDES home">
        {mark}
      </Link>
    );
  }
  return mark;
};

export default Logo;
