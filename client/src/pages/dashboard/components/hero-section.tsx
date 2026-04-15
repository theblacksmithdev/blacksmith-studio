import styled from "@emotion/styled";
import { Logo, spacing } from "@/components/shared/ui";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.lg};
`;

const LogoGlow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.sm};

  &::before {
    content: '';
    position: absolute;
    inset: -20px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--studio-accent), transparent 68%);
    opacity: 0.08;
    pointer-events: none;
  }
`;

const Wordmark = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const AppName = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--studio-text-primary);
  line-height: 1;
`;

const Tagline = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--studio-text-muted);
  max-width: 280px;
  text-align: center;
  line-height: 1.55;
`;

export function HeroSection() {
  return (
    <Wrap>
      <LogoGlow>
        <Logo size={44} variant="brand" style={{ position: "relative", zIndex: 1 }} />
      </LogoGlow>
      <Wordmark>
        <AppName>Blacksmith Studio</AppName>
        <Tagline>AI-native IDE. Build with Claude, solo or with a team of agents.</Tagline>
      </Wordmark>
    </Wrap>
  );
}
