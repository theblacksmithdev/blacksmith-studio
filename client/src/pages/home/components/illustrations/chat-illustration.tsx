import type { SVGProps } from 'react'

/**
 * Single node with chat bubble shapes — decorative illustration for the AI Chat card.
 * Center node breathes with a gentle scale animation.
 */
export function ChatIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <style>{`
        @keyframes chatBreathe {
          0%, 100% { transform: scale(1); transform-origin: 40px 40px; }
          50% { transform: scale(1.1); transform-origin: 40px 40px; }
        }
        .chat-center { animation: chatBreathe 3s ease-in-out infinite; }
      `}</style>

      {/* Connection lines */}
      <line x1="40" y1="40" x2="80" y2="20" stroke="var(--studio-border)" strokeWidth="0.8" />
      <line x1="40" y1="40" x2="85" y2="58" stroke="var(--studio-border)" strokeWidth="0.8" />

      {/* Chat bubble 1 (top-right) */}
      <rect x="68" y="10" width="28" height="18" rx="6" stroke="var(--studio-text-muted)" strokeWidth="0.8" fill="none" />
      <line x1="72" y1="17" x2="88" y2="17" stroke="var(--studio-text-muted)" strokeWidth="0.6" opacity="0.5" />
      <line x1="72" y1="21" x2="82" y2="21" stroke="var(--studio-text-muted)" strokeWidth="0.6" opacity="0.3" />

      {/* Chat bubble 2 (bottom-right) */}
      <rect x="72" y="48" width="32" height="20" rx="6" stroke="var(--studio-text-muted)" strokeWidth="0.8" fill="none" />
      <line x1="77" y1="55" x2="97" y2="55" stroke="var(--studio-text-muted)" strokeWidth="0.6" opacity="0.5" />
      <line x1="77" y1="59" x2="90" y2="59" stroke="var(--studio-text-muted)" strokeWidth="0.6" opacity="0.3" />
      <line x1="77" y1="63" x2="85" y2="63" stroke="var(--studio-text-muted)" strokeWidth="0.6" opacity="0.2" />

      {/* Center node */}
      <g className="chat-center">
        <circle cx="40" cy="40" r="10" fill="var(--studio-accent)" opacity="0.08" />
        <circle cx="40" cy="40" r="6" fill="var(--studio-accent)" opacity="0.15" />
        <circle cx="40" cy="40" r="3" fill="var(--studio-accent)" opacity="0.4" />
      </g>

      {/* Small decorative dots */}
      <circle cx="18" cy="22" r="1.5" fill="var(--studio-text-muted)" opacity="0.2" />
      <circle cx="25" cy="62" r="1" fill="var(--studio-text-muted)" opacity="0.15" />
      <circle cx="110" cy="38" r="1.5" fill="var(--studio-border-hover)" opacity="0.2" />
    </svg>
  )
}
