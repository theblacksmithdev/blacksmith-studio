import type { SVGProps } from 'react'

/**
 * Abstract forge/anvil illustration — central anvil node with radiating
 * connection lines and satellite nodes. Represents building/forging.
 * Uses CSS variables for dark mode. Nodes float with staggered delays.
 */
export function ForgeIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <style>{`
        @keyframes forgeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes forgePulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        .forge-node { animation: forgeFloat 4s ease-in-out infinite; }
        .forge-f1 { animation-delay: 0s; }
        .forge-f2 { animation-delay: 0.6s; }
        .forge-f3 { animation-delay: 1.2s; }
        .forge-f4 { animation-delay: 0.3s; }
        .forge-f5 { animation-delay: 0.9s; }
        .forge-f6 { animation-delay: 1.5s; }
        .forge-f7 { animation-delay: 1.8s; }
        .forge-spark { animation: forgePulse 2.5s ease-in-out infinite; }
        .forge-s1 { animation-delay: 0s; }
        .forge-s2 { animation-delay: 0.4s; }
        .forge-s3 { animation-delay: 0.8s; }
        .forge-s4 { animation-delay: 1.2s; }
      `}</style>

      {/* Radiating connection lines from center */}
      <line x1="120" y1="120" x2="50" y2="50" stroke="var(--studio-border)" strokeWidth="0.7" />
      <line x1="120" y1="120" x2="190" y2="45" stroke="var(--studio-border)" strokeWidth="0.7" />
      <line x1="120" y1="120" x2="210" y2="130" stroke="var(--studio-border)" strokeWidth="0.7" />
      <line x1="120" y1="120" x2="185" y2="200" stroke="var(--studio-border)" strokeWidth="0.7" />
      <line x1="120" y1="120" x2="55" y2="195" stroke="var(--studio-border)" strokeWidth="0.7" />
      <line x1="120" y1="120" x2="30" y2="120" stroke="var(--studio-border)" strokeWidth="0.7" />

      {/* Outer ring connections */}
      <line x1="50" y1="50" x2="190" y2="45" stroke="var(--studio-border)" strokeWidth="0.35" opacity="0.5" />
      <line x1="190" y1="45" x2="210" y2="130" stroke="var(--studio-border)" strokeWidth="0.35" opacity="0.5" />
      <line x1="210" y1="130" x2="185" y2="200" stroke="var(--studio-border)" strokeWidth="0.35" opacity="0.5" />
      <line x1="185" y1="200" x2="55" y2="195" stroke="var(--studio-border)" strokeWidth="0.35" opacity="0.5" />
      <line x1="55" y1="195" x2="30" y2="120" stroke="var(--studio-border)" strokeWidth="0.35" opacity="0.5" />
      <line x1="30" y1="120" x2="50" y2="50" stroke="var(--studio-border)" strokeWidth="0.35" opacity="0.5" />

      {/* Central anvil node */}
      <circle cx="120" cy="120" r="18" fill="var(--studio-accent)" opacity="0.06" />
      <circle cx="120" cy="120" r="11" fill="var(--studio-accent)" opacity="0.12" />
      <circle cx="120" cy="120" r="5" fill="var(--studio-accent)" opacity="0.35" />

      {/* Satellite nodes */}
      <g className="forge-node forge-f1">
        <circle cx="50" cy="50" r="6" stroke="var(--studio-text-muted)" strokeWidth="0.8" fill="none" />
        <circle cx="50" cy="50" r="2.5" fill="var(--studio-text-muted)" opacity="0.4" />
      </g>
      <g className="forge-node forge-f2">
        <circle cx="190" cy="45" r="5" fill="var(--studio-text-muted)" opacity="0.4" />
      </g>
      <g className="forge-node forge-f3">
        <circle cx="210" cy="130" r="7" stroke="var(--studio-border-hover)" strokeWidth="0.8" fill="none" />
      </g>
      <g className="forge-node forge-f4">
        <circle cx="185" cy="200" r="5" fill="var(--studio-text-muted)" opacity="0.35" />
      </g>
      <g className="forge-node forge-f5">
        <circle cx="55" cy="195" r="6" stroke="var(--studio-text-muted)" strokeWidth="0.8" fill="none" />
        <circle cx="55" cy="195" r="2" fill="var(--studio-text-muted)" opacity="0.3" />
      </g>
      <g className="forge-node forge-f6">
        <circle cx="30" cy="120" r="4" fill="var(--studio-text-muted)" opacity="0.3" />
      </g>

      {/* Sparks / floating particles */}
      <circle cx="85" cy="75" r="1.5" fill="var(--studio-accent)" className="forge-spark forge-s1" />
      <circle cx="160" cy="80" r="1.5" fill="var(--studio-accent)" className="forge-spark forge-s2" />
      <circle cx="155" cy="165" r="1" fill="var(--studio-accent)" className="forge-spark forge-s3" />
      <circle cx="80" cy="155" r="1.5" fill="var(--studio-accent)" className="forge-spark forge-s4" />

      {/* Tiny ambient dots */}
      <circle cx="15" cy="70" r="1" fill="var(--studio-border-hover)" opacity="0.2" className="forge-node forge-f7" />
      <circle cx="225" cy="80" r="1.5" fill="var(--studio-border-hover)" opacity="0.15" className="forge-node forge-f2" />
      <circle cx="120" cy="15" r="1" fill="var(--studio-text-muted)" opacity="0.15" className="forge-node forge-f5" />
      <circle cx="120" cy="230" r="1.5" fill="var(--studio-text-muted)" opacity="0.12" className="forge-node forge-f3" />
    </svg>
  )
}
