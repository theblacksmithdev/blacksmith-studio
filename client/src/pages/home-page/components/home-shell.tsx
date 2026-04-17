import type { ReactNode } from "react";
import styled from "@emotion/styled";
import { History } from "lucide-react";
import { HistoryPanel } from "@/components/chat/history-panel";
import { useUiStore } from "@/stores/ui-store";
import { Tooltip } from "@/components/shared/tooltip";
import { SplitPanel } from "@/components/shared/layout";
import { StudioBackground } from "@/components/shared/studio-background";

const Page = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
  position: relative;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 14px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
`;

const TopBarBtn = styled.button<{ active: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: ${({ active }) =>
    active ? "var(--studio-bg-hover)" : "transparent"};
  color: ${({ active }) =>
    active ? "var(--studio-text-primary)" : "var(--studio-text-muted)"};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  min-height: 0;
  position: relative;
  z-index: 1;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 640px;
  padding: 40px 24px;
  margin: 0 auto;
`;

interface HomeShellProps {
  children: ReactNode;
}

function MainContent({
  children,
  historyOpen,
  toggleHistory,
}: {
  children: ReactNode;
  historyOpen: boolean;
  toggleHistory: () => void;
}) {
  return (
    <Page>
      <StudioBackground />
      <TopBar>
        <Tooltip content={historyOpen ? "Close history" : "History"}>
          <TopBarBtn active={historyOpen} onClick={toggleHistory}>
            <History size={15} />
          </TopBarBtn>
        </Tooltip>
      </TopBar>

      <Content>
        <Stack>{children}</Stack>
      </Content>
    </Page>
  );
}

export function HomeShell({ children }: HomeShellProps) {
  const historyOpen = useUiStore((s) => s.historyPanelOpen);
  const toggleHistory = useUiStore((s) => s.toggleHistoryPanel);

  return (
    <SplitPanel
      left={<HistoryPanel />}
      defaultWidth={260}
      minWidth={200}
      maxWidth={400}
      storageKey="home.historyWidth"
      open={historyOpen}
    >
      <MainContent historyOpen={historyOpen} toggleHistory={toggleHistory}>
        {children}
      </MainContent>
    </SplitPanel>
  );
}

/** Thin centered divider for separating sections */
export const SectionDivider = styled.div`
  width: 40px;
  height: 1px;
  background: var(--studio-border);
  margin: 4px 0;
`;
