import styled from "@emotion/styled";

const Badge = styled.div`
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  padding: 4px 18px;
  border-radius: 999px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  font-family: "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, monospace";
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--studio-text-muted);
  text-transform: uppercase;
`;

const Headline = styled.div`
  font-size: 128px;
  font-weight: 700;
  letter-spacing: -0.06em;
  line-height: 0.9;
  color: var(--studio-text-primary);
  font-variant-numeric: tabular-nums;
`;

interface ErrorGlyphProps {
  code: string;
  label: string;
}

export function ErrorGlyph({ code, label }: ErrorGlyphProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <Badge>{label}</Badge>
      <Headline>{code}</Headline>
    </div>
  );
}
