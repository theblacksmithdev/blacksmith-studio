import { Outlet } from "react-router-dom";
import { SplitPanel } from "@/components/shared/layout";
import { RunnerDock } from "@/components/runner/dock";
import { TerminalPanel } from "@/components/terminal";
import { useTerminalPanel } from "@/hooks/use-terminal-panel";
import { Sidebar } from "../sidebar";
import { ProjectTitleBar } from "../title-bar";
import { Body, Content, Main, Root } from "./styles";

/**
 * The normal project chrome — title bar, sidebar, main content with an
 * optional terminal split, and the runner dock at the bottom. Split
 * out so the orchestrator can decide between this and the onboarding
 * via a single expression.
 */
export function ProjectLayoutReady() {
  const [terminalOpen] = useTerminalPanel();

  const mainContent = (
    <Content>
      <Outlet />
    </Content>
  );

  return (
    <Root>
      <ProjectTitleBar />
      <Body>
        <Sidebar />
        <Main>
          {terminalOpen ? (
            <SplitPanel
              left={mainContent}
              direction="vertical"
              defaultWidth={280}
              minWidth={0}
              maxWidth={600}
              storageKey="terminal.height"
              reverse
            >
              <TerminalPanel />
            </SplitPanel>
          ) : (
            mainContent
          )}
        </Main>
      </Body>
      <RunnerDock />
    </Root>
  );
}
