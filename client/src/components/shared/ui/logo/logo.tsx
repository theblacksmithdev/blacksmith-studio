import type { SVGProps } from "react";

/**
 * Blacksmith Studio Logo — Hammer + Spark
 *
 * A stylized hammer at an angle striking downward, with a burst of
 * sparks at the impact point. Represents forging and creation.
 *
 * Usage:
 *   <Logo />                          — 32px default, inherits color
 *   <Logo size={48} />                — custom size
 *   <Logo variant="mono" />           — single color (current text color)
 *   <Logo variant="brand" />          — accent hammer + green sparks
 */

export type LogoVariant = "mono" | "brand";

interface LogoProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  size?: number;
  variant?: LogoVariant;
}

export function Logo({
  size = 32,
  variant = "brand",
  style,
  ...props
}: LogoProps) {
  const isBrand = variant === "brand";

  // Colors
  const hammerColor = isBrand ? "var(--studio-accent)" : "currentColor";
  const sparkColor = isBrand ? "var(--studio-green)" : "currentColor";
  const handleColor = isBrand ? "var(--studio-text-tertiary)" : "currentColor";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      style={style}
      {...props}
    >
      <style>{`
        @keyframes logoSpark {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .logo-spark { animation: logoSpark 2s ease-in-out infinite; }
        .ls1 { animation-delay: 0s; }
        .ls2 { animation-delay: 0.3s; }
        .ls3 { animation-delay: 0.6s; }
        .ls4 { animation-delay: 0.15s; }
        .ls5 { animation-delay: 0.45s; }
      `}</style>

      {/* Hammer handle — diagonal line from top-right */}
      <line
        x1="36"
        y1="6"
        x2="22"
        y2="20"
        stroke={handleColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Hammer head — bold rectangle at angle */}
      <rect
        x="12"
        y="14"
        width="16"
        height="10"
        rx="2.5"
        fill={hammerColor}
        transform="rotate(-35 20 19)"
      />

      {/* Strike point / impact line */}
      <line
        x1="14"
        y1="30"
        x2="28"
        y2="30"
        stroke={hammerColor}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* ── Sparks ── */}

      {/* Center spark — biggest */}
      <circle
        cx="21"
        cy="33"
        r="2"
        fill={sparkColor}
        className="logo-spark ls1"
        style={{ transformOrigin: "21px 33px" }}
      />

      {/* Upper-left spark */}
      <circle
        cx="13"
        cy="28"
        r="1.5"
        fill={sparkColor}
        className="logo-spark ls2"
        style={{ transformOrigin: "13px 28px" }}
      />

      {/* Upper-right spark */}
      <circle
        cx="29"
        cy="27"
        r="1.3"
        fill={sparkColor}
        className="logo-spark ls3"
        style={{ transformOrigin: "29px 27px" }}
      />

      {/* Lower-left spark */}
      <circle
        cx="15"
        cy="37"
        r="1"
        fill={sparkColor}
        className="logo-spark ls4"
        style={{ transformOrigin: "15px 37px" }}
      />

      {/* Lower-right spark */}
      <circle
        cx="28"
        cy="36"
        r="1.2"
        fill={sparkColor}
        className="logo-spark ls5"
        style={{ transformOrigin: "28px 36px" }}
      />

      {/* Tiny flying sparks */}
      <circle
        cx="9"
        cy="34"
        r="0.7"
        fill={sparkColor}
        opacity="0.5"
        className="logo-spark ls3"
        style={{ transformOrigin: "9px 34px" }}
      />
      <circle
        cx="33"
        cy="32"
        r="0.6"
        fill={sparkColor}
        opacity="0.4"
        className="logo-spark ls1"
        style={{ transformOrigin: "33px 32px" }}
      />
      <circle
        cx="21"
        cy="41"
        r="0.8"
        fill={sparkColor}
        opacity="0.4"
        className="logo-spark ls5"
        style={{ transformOrigin: "21px 41px" }}
      />
    </svg>
  );
}
