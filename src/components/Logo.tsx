import { Link } from "react-router-dom";
import logoLight from "@/assets/gesod-logo-light.png";

interface LogoProps {
  /** Render as a link to the home page. */
  to?: string;
  /** Tailwind height (and any other) classes — controls the rendered size. Defaults to the navbar/sidebar size. */
  className?: string;
}

// Every current surface (navbar, both dashboards, auth pages) uses the dark
// navy theme, so this always renders the light/white logo mark. If a
// light-background surface is ever added, bring in a matching dark-mark
// asset and branch on a `variant` prop here rather than hardcoding one image.
const GESOD_RIDES_HOME = "GESOD RIDES home";

const Logo = ({ to, className = "" }: LogoProps) => {
  const mark = (
    <img
      src={logoLight}
      alt="GESOD RIDES"
      className={`h-8 w-auto object-contain ${className}`}
    />
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex shrink-0" aria-label={GESOD_RIDES_HOME}>
        {mark}
      </Link>
    );
  }
  return mark;
};

export default Logo;
