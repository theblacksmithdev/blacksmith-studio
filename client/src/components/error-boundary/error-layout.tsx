import type { ReactNode } from "react";
import styled from "@emotion/styled";
import { StudioBackground } from "@/components/shared/studio-background";

const Shell = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: var(--studio-bg-main);
  overflow: hidden;
`;

const Stack = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  max-width: 560px;
  text-align: center;
  animation: studio-error-in 260ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @keyframes studio-error-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export function ErrorLayout({ children }: { children: ReactNode }) {
  return (
    <Shell>
      <StudioBackground />
      <Stack>{children}</Stack>
    </Shell>
  );
}
