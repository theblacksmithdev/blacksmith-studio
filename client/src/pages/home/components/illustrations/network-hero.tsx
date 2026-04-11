import type { SVGProps } from 'react'

/**
 * Abstract network of connected nodes — decorative background for the right panel.
 * Uses CSS variables for dark mode. Nodes float with staggered CSS animations.
 */
export function NetworkHero(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .hero-node { animation: heroFloat 4s ease-in-out infinite; }
        .hero-n1 { animation-delay: 0s; }
        .hero-n2 { animation-delay: 0.5s; }
        .hero-n3 { animation-delay: 1s; }
        .hero-n4 { animation-delay: 1.5s; }
        .hero-n5 { animation-delay: 2s; }
        .hero-n6 { animation-delay: 0.3s; }
        .hero-n7 { animation-delay: 1.2s; }
        .hero-n8 { animation-delay: 0.8s; }
        .hero-n9 { animation-delay: 1.8s; }
      `}</style>

      {/* Connections */}
      <line x1="150" y1="60" x2="80" y2="140" stroke="var(--studio-border)" strokeWidth="0.8" />
      <line x1="150" y1="60" x2="230" y2="120" stroke="var(--studio-border)" strokeWidth="0.8" />
      <line x1="80" y1="140" x2="60" y2="240" stroke="var(--studio-border)" strokeWidth="0.6" />
      <line x1="80" y1="140" x2="180" y2="200" stroke="var(--studio-border)" strokeWidth="0.8" />
      <line x1="230" y1="120" x2="180" y2="200" stroke="var(--studio-border)" strokeWidth="0.6" />
      <line x1="230" y1="120" x2="260" y2="220" stroke="var(--studio-border)" strokeWidth="0.8" />
      <line x1="180" y1="200" x2="120" y2="300" stroke="var(--studio-border)" strokeWidth="0.6" />
      <line x1="180" y1="200" x2="240" y2="310" stroke="var(--studio-border)" strokeWidth="0.6" />
      <line x1="60" y1="240" x2="120" y2="300" stroke="var(--studio-border)" strokeWidth="0.8" />
      <line x1="260" y1="220" x2="240" y2="310" stroke="var(--studio-border)" strokeWidth="0.6" />
      <line x1="120" y1="300" x2="170" y2="370" stroke="var(--studio-border)" strokeWidth="0.8" />
      <line x1="240" y1="310" x2="170" y2="370" stroke="var(--studio-border)" strokeWidth="0.6" />

      {/* Nodes */}
      <g className="hero-node hero-n1">
        <circle cx="150" cy="60" r="8" fill="var(--studio-green)" opacity="0.6" />
        <circle cx="150" cy="60" r="4" fill="var(--studio-green)" />
      </g>
      <g className="hero-node hero-n2">
        <circle cx="80" cy="140" r="6" stroke="var(--studio-text-muted)" strokeWidth="1" fill="none" />
      </g>
      <g className="hero-node hero-n3">
        <circle cx="230" cy="120" r="5" fill="var(--studio-text-muted)" opacity="0.5" />
      </g>
      <g className="hero-node hero-n4">
        <circle cx="180" cy="200" r="7" fill="var(--studio-green)" opacity="0.4" />
        <circle cx="180" cy="200" r="3" fill="var(--studio-green)" opacity="0.8" />
      </g>
      <g className="hero-node hero-n5">
        <circle cx="60" cy="240" r="4" stroke="var(--studio-text-muted)" strokeWidth="0.8" fill="none" />
      </g>
      <g className="hero-node hero-n6">
        <circle cx="260" cy="220" r="5" fill="var(--studio-text-muted)" opacity="0.4" />
      </g>
      <g className="hero-node hero-n7">
        <circle cx="120" cy="300" r="6" stroke="var(--studio-border-hover)" strokeWidth="1" fill="none" />
      </g>
      <g className="hero-node hero-n8">
        <circle cx="240" cy="310" r="4" fill="var(--studio-text-muted)" opacity="0.3" />
      </g>
      <g className="hero-node hero-n9">
        <circle cx="170" cy="370" r="6" fill="var(--studio-green)" opacity="0.3" />
        <circle cx="170" cy="370" r="3" fill="var(--studio-green)" opacity="0.6" />
      </g>

      {/* Floating particles */}
      <circle cx="40" cy="80" r="1.5" fill="var(--studio-text-muted)" opacity="0.25" className="hero-node hero-n6" />
      <circle cx="270" cy="60" r="2" fill="var(--studio-border-hover)" opacity="0.2" className="hero-node hero-n8" />
      <circle cx="20" cy="320" r="1.5" fill="var(--studio-text-muted)" opacity="0.2" className="hero-node hero-n2" />
      <circle cx="280" cy="370" r="2" fill="var(--studio-border-hover)" opacity="0.15" className="hero-node hero-n5" />
    </svg>
  )
}
