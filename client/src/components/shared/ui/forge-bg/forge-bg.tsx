import type { SVGProps } from 'react'

/**
 * ForgeBg — Connected Building Blocks background illustration.
 *
 * Geometric shapes (code brackets, component rectangles, UI frames)
 * connected by lines, assembling into a structure. Represents code
 * blocks being forged together — the Blacksmith Studio brand.
 *
 * Usage:
 *   <ForgeBg />                          — full opacity hero
 *   <ForgeBg variant="subtle" />         — background behind content
 *   <ForgeBg variant="minimal" />        — very faint backdrop
 */

export type ForgeBgVariant = 'hero' | 'subtle' | 'minimal'

interface ForgeBgProps extends SVGProps<SVGSVGElement> {
  variant?: ForgeBgVariant
}

const variantOpacity: Record<ForgeBgVariant, number> = {
  hero: 1,
  subtle: 0.5,
  minimal: 0.3,
}

export function ForgeBg({ variant = 'hero', style, ...props }: ForgeBgProps) {
  const opacity = variantOpacity[variant]

  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity, ...style }}
      {...props}
    >
      <defs>
        {/* Warm glow from bottom-center — like forge heat */}
        <radialGradient id="fb-glow" cx="50%" cy="80%" r="60%" fx="50%" fy="85%">
          <stop offset="0%" stopColor="var(--studio-green)" stopOpacity="0.12" />
          <stop offset="40%" stopColor="var(--studio-green)" stopOpacity="0.04" />
          <stop offset="100%" stopColor="var(--studio-green)" stopOpacity="0" />
        </radialGradient>
        {/* Top-left ambient */}
        <radialGradient id="fb-amb" cx="15%" cy="20%" r="40%">
          <stop offset="0%" stopColor="var(--studio-accent)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="var(--studio-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <style>{`
        @keyframes fbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes fbPulse{0%,100%{opacity:.3}50%{opacity:.7}}
        @keyframes fbAssemble{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
        .fb-f{animation:fbFloat 5s ease-in-out infinite}
        .fb-p{animation:fbPulse 3s ease-in-out infinite}
        .f0{animation-delay:0s}.f1{animation-delay:.5s}.f2{animation-delay:1s}
        .f3{animation-delay:1.5s}.f4{animation-delay:2s}.f5{animation-delay:2.5s}
        .f6{animation-delay:.3s}.f7{animation-delay:.8s}.f8{animation-delay:1.3s}
        .f9{animation-delay:1.8s}
      `}</style>

      {/* Background glows */}
      <rect width="800" height="600" fill="url(#fb-glow)" />
      <rect width="800" height="600" fill="url(#fb-amb)" />

      {/* ════════════════════════════════════
          CONNECTION LINES — the "wiring"
          ════════════════════════════════════ */}

      {/* Central hub connections */}
      <line x1="400" y1="300" x2="250" y2="180" stroke="var(--studio-border)" strokeWidth="1" />
      <line x1="400" y1="300" x2="560" y2="175" stroke="var(--studio-border)" strokeWidth="1" />
      <line x1="400" y1="300" x2="200" y2="370" stroke="var(--studio-border)" strokeWidth="1" />
      <line x1="400" y1="300" x2="600" y2="380" stroke="var(--studio-border)" strokeWidth="1" />
      <line x1="400" y1="300" x2="400" y2="460" stroke="var(--studio-border)" strokeWidth="1" />

      {/* Branch connections */}
      <line x1="250" y1="180" x2="110" y2="110" stroke="var(--studio-border)" strokeWidth=".7" />
      <line x1="250" y1="180" x2="150" y2="270" stroke="var(--studio-border)" strokeWidth=".7" />
      <line x1="560" y1="175" x2="700" y2="100" stroke="var(--studio-border)" strokeWidth=".7" />
      <line x1="560" y1="175" x2="670" y2="260" stroke="var(--studio-border)" strokeWidth=".7" />
      <line x1="200" y1="370" x2="80" y2="430" stroke="var(--studio-border)" strokeWidth=".6" />
      <line x1="600" y1="380" x2="720" y2="440" stroke="var(--studio-border)" strokeWidth=".6" />
      <line x1="400" y1="460" x2="300" y2="530" stroke="var(--studio-border)" strokeWidth=".6" />
      <line x1="400" y1="460" x2="500" y2="530" stroke="var(--studio-border)" strokeWidth=".6" />

      {/* Cross connections */}
      <line x1="250" y1="180" x2="560" y2="175" stroke="var(--studio-border)" strokeWidth=".4" opacity=".4" />
      <line x1="200" y1="370" x2="600" y2="380" stroke="var(--studio-border)" strokeWidth=".4" opacity=".4" />

      {/* ════════════════════════════════════
          BUILDING BLOCKS — code components
          ════════════════════════════════════ */}

      {/* Central block — main app frame */}
      <g className="fb-f f0">
        <rect x="370" y="270" width="60" height="60" rx="8" stroke="var(--studio-text-muted)" strokeWidth="1.2" opacity=".6" />
        <rect x="378" y="278" width="44" height="6" rx="2" fill="var(--studio-green)" opacity=".4" />
        <rect x="378" y="290" width="30" height="4" rx="1.5" fill="var(--studio-text-muted)" opacity=".25" />
        <rect x="378" y="300" width="36" height="4" rx="1.5" fill="var(--studio-text-muted)" opacity=".2" />
        <rect x="378" y="310" width="20" height="4" rx="1.5" fill="var(--studio-text-muted)" opacity=".15" />
      </g>

      {/* Top-left block — component card */}
      <g className="fb-f f1">
        <rect x="220" y="152" width="55" height="50" rx="7" stroke="var(--studio-text-muted)" strokeWidth="1" opacity=".5" />
        <rect x="228" y="160" width="20" height="20" rx="4" fill="var(--studio-green)" opacity=".25" />
        <rect x="228" y="186" width="38" height="4" rx="1.5" fill="var(--studio-text-muted)" opacity=".2" />
      </g>

      {/* Top-right block — API endpoint */}
      <g className="fb-f f2">
        <rect x="530" y="148" width="58" height="48" rx="7" stroke="var(--studio-text-muted)" strokeWidth="1" opacity=".5" />
        <text x="540" y="170" fill="var(--studio-green)" opacity=".5" fontSize="9" fontFamily="monospace" fontWeight="600">GET</text>
        <rect x="538" y="178" width="40" height="4" rx="1.5" fill="var(--studio-text-muted)" opacity=".2" />
      </g>

      {/* Left block — database model */}
      <g className="fb-f f3">
        <rect x="165" y="345" width="52" height="45" rx="6" stroke="var(--studio-text-muted)" strokeWidth=".8" opacity=".45" />
        <rect x="173" y="353" width="36" height="4" rx="1.5" fill="var(--studio-text-muted)" opacity=".3" />
        <rect x="173" y="361" width="28" height="3" rx="1" fill="var(--studio-text-muted)" opacity=".2" />
        <rect x="173" y="368" width="32" height="3" rx="1" fill="var(--studio-text-muted)" opacity=".15" />
        <rect x="173" y="375" width="24" height="3" rx="1" fill="var(--studio-text-muted)" opacity=".12" />
      </g>

      {/* Right block — UI component */}
      <g className="fb-f f4">
        <rect x="570" y="355" width="56" height="48" rx="7" stroke="var(--studio-text-muted)" strokeWidth=".8" opacity=".45" />
        <rect x="578" y="363" width="40" height="14" rx="3" stroke="var(--studio-text-muted)" strokeWidth=".6" fill="none" opacity=".3" />
        <rect x="578" y="383" width="22" height="8" rx="3" fill="var(--studio-green)" opacity=".2" />
      </g>

      {/* Bottom block — test suite */}
      <g className="fb-f f5">
        <rect x="370" y="435" width="58" height="46" rx="7" stroke="var(--studio-text-muted)" strokeWidth=".8" opacity=".45" />
        <circle cx="383" cy="450" r="3" fill="var(--studio-green)" opacity=".4" />
        <rect x="391" y="447" width="28" height="4" rx="1.5" fill="var(--studio-text-muted)" opacity=".2" />
        <circle cx="383" cy="462" r="3" fill="var(--studio-green)" opacity=".3" />
        <rect x="391" y="459" width="22" height="4" rx="1.5" fill="var(--studio-text-muted)" opacity=".15" />
      </g>

      {/* ════════════════════════════════════
          OUTER FRAGMENTS — smaller pieces
          ════════════════════════════════════ */}

      {/* Top-left small — code bracket */}
      <g className="fb-f f6">
        <rect x="85" y="88" width="40" height="36" rx="5" stroke="var(--studio-border-hover)" strokeWidth=".7" opacity=".35" />
        <text x="95" y="112" fill="var(--studio-text-muted)" opacity=".3" fontSize="14" fontFamily="monospace">{'{ }'}</text>
      </g>

      {/* Top-right small — config file */}
      <g className="fb-f f7">
        <rect x="675" y="78" width="42" height="38" rx="5" stroke="var(--studio-border-hover)" strokeWidth=".7" opacity=".35" />
        <rect x="683" y="86" width="26" height="3" rx="1" fill="var(--studio-text-muted)" opacity=".2" />
        <rect x="683" y="93" width="20" height="3" rx="1" fill="var(--studio-text-muted)" opacity=".15" />
        <rect x="683" y="100" width="24" height="3" rx="1" fill="var(--studio-text-muted)" opacity=".12" />
      </g>

      {/* Mid-left small */}
      <g className="fb-f f8">
        <rect x="125" y="248" width="36" height="32" rx="5" stroke="var(--studio-border-hover)" strokeWidth=".6" opacity=".3" />
        <rect x="132" y="256" width="22" height="3" rx="1" fill="var(--studio-text-muted)" opacity=".2" />
        <rect x="132" y="263" width="16" height="3" rx="1" fill="var(--studio-text-muted)" opacity=".15" />
      </g>

      {/* Mid-right small */}
      <g className="fb-f f9">
        <rect x="645" y="238" width="38" height="34" rx="5" stroke="var(--studio-border-hover)" strokeWidth=".6" opacity=".3" />
        <rect x="653" y="246" width="22" height="10" rx="3" stroke="var(--studio-text-muted)" strokeWidth=".5" fill="none" opacity=".25" />
      </g>

      {/* Bottom-left */}
      <g className="fb-f f2">
        <rect x="55" y="410" width="38" height="32" rx="5" stroke="var(--studio-border-hover)" strokeWidth=".6" opacity=".25" />
      </g>

      {/* Bottom-right */}
      <g className="fb-f f6">
        <rect x="700" y="420" width="36" height="30" rx="5" stroke="var(--studio-border-hover)" strokeWidth=".6" opacity=".25" />
      </g>

      {/* Bottom pair */}
      <g className="fb-f f3">
        <rect x="275" y="510" width="34" height="28" rx="4" stroke="var(--studio-border-hover)" strokeWidth=".5" opacity=".2" />
      </g>
      <g className="fb-f f8">
        <rect x="480" y="512" width="36" height="30" rx="4" stroke="var(--studio-border-hover)" strokeWidth=".5" opacity=".2" />
      </g>

      {/* ════════════════════════════════════
          DATA FLOW SPARKS — along connections
          ════════════════════════════════════ */}
      <circle cx="325" cy="240" r="2.5" fill="var(--studio-green)" className="fb-p f0" />
      <circle cx="480" cy="238" r="2.5" fill="var(--studio-green)" className="fb-p f2" />
      <circle cx="300" cy="335" r="2" fill="var(--studio-green)" className="fb-p f4" />
      <circle cx="500" cy="340" r="2" fill="var(--studio-green)" className="fb-p f1" />
      <circle cx="400" cy="380" r="2" fill="var(--studio-green)" className="fb-p f5" />
      <circle cx="180" cy="220" r="1.5" fill="var(--studio-green)" className="fb-p f7" />
      <circle cx="630" cy="215" r="1.5" fill="var(--studio-green)" className="fb-p f9" />

      {/* Ambient dust */}
      <circle cx="50" cy="200" r="1.5" fill="var(--studio-text-muted)" opacity=".1" className="fb-f f4" />
      <circle cx="750" cy="180" r="2" fill="var(--studio-text-muted)" opacity=".08" className="fb-f f1" />
      <circle cx="400" cy="50" r="1.5" fill="var(--studio-text-muted)" opacity=".08" className="fb-f f5" />
      <circle cx="400" cy="570" r="2" fill="var(--studio-text-muted)" opacity=".06" className="fb-f f9" />
    </svg>
  )
}
