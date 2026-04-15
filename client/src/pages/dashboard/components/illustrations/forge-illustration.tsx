import type { SVGProps } from "react";

/**
 * Full-viewport abstract network illustration.
 * Large interconnected node graph representing an agentic system.
 * Spans the entire background — meant to be rendered behind content.
 */
export function ForgeIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1200 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      {...props}
    >
      <style>{`
        @keyframes bgFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes bgPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.5; }
        }
        @keyframes bgGlow {
          0%, 100% { r: 3; opacity: 0.4; }
          50% { r: 5; opacity: 0.8; }
        }
        .bg-n { animation: bgFloat 5s ease-in-out infinite; }
        .bg-d0 { animation-delay: 0s; }
        .bg-d1 { animation-delay: 0.4s; }
        .bg-d2 { animation-delay: 0.8s; }
        .bg-d3 { animation-delay: 1.2s; }
        .bg-d4 { animation-delay: 1.6s; }
        .bg-d5 { animation-delay: 2.0s; }
        .bg-d6 { animation-delay: 2.4s; }
        .bg-d7 { animation-delay: 0.6s; }
        .bg-d8 { animation-delay: 1.0s; }
        .bg-d9 { animation-delay: 1.4s; }
        .bg-spark { animation: bgPulse 3s ease-in-out infinite; }
        .bg-sk0 { animation-delay: 0s; }
        .bg-sk1 { animation-delay: 0.5s; }
        .bg-sk2 { animation-delay: 1.0s; }
        .bg-sk3 { animation-delay: 1.5s; }
        .bg-sk4 { animation-delay: 2.0s; }
        .bg-sk5 { animation-delay: 2.5s; }
      `}</style>

      {/* ── Primary network connections ── */}
      {/* Central hub cluster */}
      <line
        x1="600"
        y1="400"
        x2="420"
        y2="280"
        stroke="var(--studio-border)"
        strokeWidth="1"
      />
      <line
        x1="600"
        y1="400"
        x2="780"
        y2="290"
        stroke="var(--studio-border)"
        strokeWidth="1"
      />
      <line
        x1="600"
        y1="400"
        x2="500"
        y2="550"
        stroke="var(--studio-border)"
        strokeWidth="1"
      />
      <line
        x1="600"
        y1="400"
        x2="740"
        y2="540"
        stroke="var(--studio-border)"
        strokeWidth="1"
      />
      <line
        x1="600"
        y1="400"
        x2="350"
        y2="420"
        stroke="var(--studio-border)"
        strokeWidth="0.8"
      />
      <line
        x1="600"
        y1="400"
        x2="850"
        y2="400"
        stroke="var(--studio-border)"
        strokeWidth="0.8"
      />

      {/* Outer branches */}
      <line
        x1="420"
        y1="280"
        x2="250"
        y2="180"
        stroke="var(--studio-border)"
        strokeWidth="0.6"
      />
      <line
        x1="420"
        y1="280"
        x2="300"
        y2="350"
        stroke="var(--studio-border)"
        strokeWidth="0.6"
      />
      <line
        x1="780"
        y1="290"
        x2="950"
        y2="200"
        stroke="var(--studio-border)"
        strokeWidth="0.6"
      />
      <line
        x1="780"
        y1="290"
        x2="900"
        y2="350"
        stroke="var(--studio-border)"
        strokeWidth="0.6"
      />
      <line
        x1="500"
        y1="550"
        x2="350"
        y2="650"
        stroke="var(--studio-border)"
        strokeWidth="0.6"
      />
      <line
        x1="740"
        y1="540"
        x2="880"
        y2="630"
        stroke="var(--studio-border)"
        strokeWidth="0.6"
      />
      <line
        x1="350"
        y1="420"
        x2="150"
        y2="380"
        stroke="var(--studio-border)"
        strokeWidth="0.5"
      />
      <line
        x1="850"
        y1="400"
        x2="1050"
        y2="420"
        stroke="var(--studio-border)"
        strokeWidth="0.5"
      />

      {/* Far edge tendrils */}
      <line
        x1="250"
        y1="180"
        x2="100"
        y2="100"
        stroke="var(--studio-border)"
        strokeWidth="0.3"
        opacity="0.6"
      />
      <line
        x1="950"
        y1="200"
        x2="1100"
        y2="120"
        stroke="var(--studio-border)"
        strokeWidth="0.3"
        opacity="0.6"
      />
      <line
        x1="350"
        y1="650"
        x2="200"
        y2="730"
        stroke="var(--studio-border)"
        strokeWidth="0.3"
        opacity="0.6"
      />
      <line
        x1="880"
        y1="630"
        x2="1020"
        y2="720"
        stroke="var(--studio-border)"
        strokeWidth="0.3"
        opacity="0.6"
      />
      <line
        x1="150"
        y1="380"
        x2="60"
        y2="300"
        stroke="var(--studio-border)"
        strokeWidth="0.3"
        opacity="0.5"
      />
      <line
        x1="1050"
        y1="420"
        x2="1140"
        y2="500"
        stroke="var(--studio-border)"
        strokeWidth="0.3"
        opacity="0.5"
      />

      {/* Cross connections */}
      <line
        x1="420"
        y1="280"
        x2="780"
        y2="290"
        stroke="var(--studio-border)"
        strokeWidth="0.4"
        opacity="0.4"
      />
      <line
        x1="500"
        y1="550"
        x2="740"
        y2="540"
        stroke="var(--studio-border)"
        strokeWidth="0.4"
        opacity="0.4"
      />
      <line
        x1="250"
        y1="180"
        x2="350"
        y2="420"
        stroke="var(--studio-border)"
        strokeWidth="0.3"
        opacity="0.3"
      />
      <line
        x1="950"
        y1="200"
        x2="850"
        y2="400"
        stroke="var(--studio-border)"
        strokeWidth="0.3"
        opacity="0.3"
      />

      {/* ── Central hub node ── */}
      <circle
        cx="600"
        cy="400"
        r="28"
        fill="var(--studio-accent)"
        opacity="0.03"
      />
      <circle
        cx="600"
        cy="400"
        r="16"
        fill="var(--studio-accent)"
        opacity="0.06"
      />
      <circle
        cx="600"
        cy="400"
        r="7"
        fill="var(--studio-accent)"
        opacity="0.15"
      />

      {/* ── Primary nodes ── */}
      <g className="bg-n bg-d0">
        <circle
          cx="420"
          cy="280"
          r="10"
          fill="var(--studio-accent)"
          opacity="0.04"
        />
        <circle
          cx="420"
          cy="280"
          r="5"
          stroke="var(--studio-text-muted)"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />
      </g>
      <g className="bg-n bg-d1">
        <circle
          cx="780"
          cy="290"
          r="10"
          fill="var(--studio-accent)"
          opacity="0.04"
        />
        <circle
          cx="780"
          cy="290"
          r="5"
          stroke="var(--studio-text-muted)"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />
      </g>
      <g className="bg-n bg-d2">
        <circle
          cx="500"
          cy="550"
          r="8"
          fill="var(--studio-accent)"
          opacity="0.03"
        />
        <circle
          cx="500"
          cy="550"
          r="4"
          stroke="var(--studio-text-muted)"
          strokeWidth="0.8"
          fill="none"
          opacity="0.4"
        />
      </g>
      <g className="bg-n bg-d3">
        <circle
          cx="740"
          cy="540"
          r="8"
          fill="var(--studio-accent)"
          opacity="0.03"
        />
        <circle
          cx="740"
          cy="540"
          r="4"
          stroke="var(--studio-text-muted)"
          strokeWidth="0.8"
          fill="none"
          opacity="0.4"
        />
      </g>
      <g className="bg-n bg-d4">
        <circle
          cx="350"
          cy="420"
          r="4"
          fill="var(--studio-text-muted)"
          opacity="0.3"
        />
      </g>
      <g className="bg-n bg-d5">
        <circle
          cx="850"
          cy="400"
          r="4"
          fill="var(--studio-text-muted)"
          opacity="0.3"
        />
      </g>

      {/* ── Secondary nodes ── */}
      <g className="bg-n bg-d6">
        <circle
          cx="250"
          cy="180"
          r="6"
          stroke="var(--studio-border-hover)"
          strokeWidth="0.8"
          fill="none"
          opacity="0.4"
        />
      </g>
      <g className="bg-n bg-d7">
        <circle
          cx="950"
          cy="200"
          r="5"
          fill="var(--studio-text-muted)"
          opacity="0.25"
        />
      </g>
      <g className="bg-n bg-d8">
        <circle
          cx="300"
          cy="350"
          r="3"
          fill="var(--studio-text-muted)"
          opacity="0.2"
        />
      </g>
      <g className="bg-n bg-d9">
        <circle
          cx="900"
          cy="350"
          r="3.5"
          fill="var(--studio-text-muted)"
          opacity="0.2"
        />
      </g>
      <g className="bg-n bg-d3">
        <circle
          cx="350"
          cy="650"
          r="4"
          stroke="var(--studio-border-hover)"
          strokeWidth="0.6"
          fill="none"
          opacity="0.3"
        />
      </g>
      <g className="bg-n bg-d7">
        <circle
          cx="880"
          cy="630"
          r="3.5"
          fill="var(--studio-text-muted)"
          opacity="0.2"
        />
      </g>

      {/* ── Edge nodes ── */}
      <g className="bg-n bg-d1">
        <circle
          cx="100"
          cy="100"
          r="2.5"
          fill="var(--studio-text-muted)"
          opacity="0.15"
        />
      </g>
      <g className="bg-n bg-d5">
        <circle
          cx="1100"
          cy="120"
          r="3"
          fill="var(--studio-text-muted)"
          opacity="0.12"
        />
      </g>
      <g className="bg-n bg-d9">
        <circle
          cx="150"
          cy="380"
          r="3"
          fill="var(--studio-text-muted)"
          opacity="0.15"
        />
      </g>
      <g className="bg-n bg-d2">
        <circle
          cx="1050"
          cy="420"
          r="2.5"
          fill="var(--studio-text-muted)"
          opacity="0.12"
        />
      </g>
      <g className="bg-n bg-d6">
        <circle
          cx="200"
          cy="730"
          r="2"
          fill="var(--studio-text-muted)"
          opacity="0.1"
        />
      </g>
      <g className="bg-n bg-d4">
        <circle
          cx="1020"
          cy="720"
          r="2.5"
          fill="var(--studio-text-muted)"
          opacity="0.1"
        />
      </g>
      <g className="bg-n bg-d8">
        <circle
          cx="60"
          cy="300"
          r="2"
          fill="var(--studio-text-muted)"
          opacity="0.1"
        />
      </g>
      <g className="bg-n bg-d0">
        <circle
          cx="1140"
          cy="500"
          r="2"
          fill="var(--studio-text-muted)"
          opacity="0.1"
        />
      </g>

      {/* ── Pulsing sparks along connections ── */}
      <circle
        cx="510"
        cy="340"
        r="2"
        fill="var(--studio-green)"
        className="bg-spark bg-sk0"
      />
      <circle
        cx="690"
        cy="345"
        r="2"
        fill="var(--studio-green)"
        className="bg-spark bg-sk1"
      />
      <circle
        cx="550"
        cy="475"
        r="1.5"
        fill="var(--studio-green)"
        className="bg-spark bg-sk2"
      />
      <circle
        cx="670"
        cy="470"
        r="1.5"
        fill="var(--studio-green)"
        className="bg-spark bg-sk3"
      />
      <circle
        cx="335"
        cy="330"
        r="1.5"
        fill="var(--studio-green)"
        className="bg-spark bg-sk4"
      />
      <circle
        cx="865"
        cy="345"
        r="1.5"
        fill="var(--studio-green)"
        className="bg-spark bg-sk5"
      />

      {/* ── Ambient scattered particles ── */}
      <circle
        cx="80"
        cy="500"
        r="1"
        fill="var(--studio-border-hover)"
        opacity="0.12"
        className="bg-n bg-d3"
      />
      <circle
        cx="1120"
        cy="300"
        r="1.5"
        fill="var(--studio-border-hover)"
        opacity="0.1"
        className="bg-n bg-d7"
      />
      <circle
        cx="500"
        cy="100"
        r="1"
        fill="var(--studio-border-hover)"
        opacity="0.1"
        className="bg-n bg-d1"
      />
      <circle
        cx="700"
        cy="750"
        r="1.5"
        fill="var(--studio-border-hover)"
        opacity="0.08"
        className="bg-n bg-d5"
      />
      <circle
        cx="180"
        cy="600"
        r="1"
        fill="var(--studio-border-hover)"
        opacity="0.08"
        className="bg-n bg-d9"
      />
      <circle
        cx="1000"
        cy="580"
        r="1"
        fill="var(--studio-border-hover)"
        opacity="0.08"
        className="bg-n bg-d2"
      />
    </svg>
  );
}
