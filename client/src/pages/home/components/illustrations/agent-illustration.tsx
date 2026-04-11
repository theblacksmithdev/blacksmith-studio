import type { SVGProps } from 'react'

/**
 * Multi-node network — decorative illustration for the Agent Team card.
 * Peripheral nodes pulse with staggered opacity to suggest activity.
 */
export function AgentIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <style>{`
        @keyframes agentPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        .agent-p1 { animation: agentPulse 3s ease-in-out infinite; animation-delay: 0s; }
        .agent-p2 { animation: agentPulse 3s ease-in-out infinite; animation-delay: 0.5s; }
        .agent-p3 { animation: agentPulse 3s ease-in-out infinite; animation-delay: 1s; }
        .agent-p4 { animation: agentPulse 3s ease-in-out infinite; animation-delay: 1.5s; }
        .agent-p5 { animation: agentPulse 3s ease-in-out infinite; animation-delay: 2s; }
      `}</style>

      {/* Connections from center to peripherals */}
      <line x1="55" y1="40" x2="25" y2="18" stroke="var(--studio-border)" strokeWidth="0.7" />
      <line x1="55" y1="40" x2="90" y2="15" stroke="var(--studio-border)" strokeWidth="0.7" />
      <line x1="55" y1="40" x2="100" y2="45" stroke="var(--studio-border)" strokeWidth="0.7" />
      <line x1="55" y1="40" x2="85" y2="68" stroke="var(--studio-border)" strokeWidth="0.7" />
      <line x1="55" y1="40" x2="20" y2="60" stroke="var(--studio-border)" strokeWidth="0.7" />

      {/* Inter-node connections */}
      <line x1="25" y1="18" x2="90" y2="15" stroke="var(--studio-border)" strokeWidth="0.4" opacity="0.5" />
      <line x1="90" y1="15" x2="100" y2="45" stroke="var(--studio-border)" strokeWidth="0.4" opacity="0.5" />
      <line x1="100" y1="45" x2="85" y2="68" stroke="var(--studio-border)" strokeWidth="0.4" opacity="0.5" />
      <line x1="85" y1="68" x2="20" y2="60" stroke="var(--studio-border)" strokeWidth="0.4" opacity="0.5" />
      <line x1="20" y1="60" x2="25" y2="18" stroke="var(--studio-border)" strokeWidth="0.4" opacity="0.5" />

      {/* Center node (PM) */}
      <circle cx="55" cy="40" r="9" fill="var(--studio-green)" opacity="0.1" />
      <circle cx="55" cy="40" r="5" fill="var(--studio-green)" opacity="0.25" />
      <circle cx="55" cy="40" r="2.5" fill="var(--studio-green)" opacity="0.6" />

      {/* Peripheral nodes */}
      <g className="agent-p1">
        <circle cx="25" cy="18" r="4" fill="var(--studio-text-muted)" />
      </g>
      <g className="agent-p2">
        <circle cx="90" cy="15" r="3.5" fill="var(--studio-text-muted)" />
      </g>
      <g className="agent-p3">
        <circle cx="100" cy="45" r="3" fill="var(--studio-text-muted)" />
      </g>
      <g className="agent-p4">
        <circle cx="85" cy="68" r="4" fill="var(--studio-text-muted)" />
      </g>
      <g className="agent-p5">
        <circle cx="20" cy="60" r="3" fill="var(--studio-text-muted)" />
      </g>

      {/* Tiny particles */}
      <circle cx="10" cy="38" r="1" fill="var(--studio-border-hover)" opacity="0.2" />
      <circle cx="112" cy="30" r="1.5" fill="var(--studio-border-hover)" opacity="0.15" />
      <circle cx="55" cy="8" r="1" fill="var(--studio-text-muted)" opacity="0.15" />
    </svg>
  )
}
