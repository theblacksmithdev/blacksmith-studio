import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Outlet, useNavigate } from "react-router-dom";
import { useProjectQuery, useTouchProject } from "@/api/hooks/projects";
import { useSettingsQuery } from "@/api/hooks/settings";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { useRunnerListener } from "@/hooks/use-runner";
import { useGitListener } from "@/hooks/use-git";
import { useUiStore } from "@/stores/ui-store";
import { useTerminalPanel } from "@/hooks/use-terminal-panel";
import { SplitPanel } from "@/components/shared/layout";
import { RunnerDock } from "@/components/runner/dock";
import { TerminalPanel } from "@/components/terminal";
import {
  ProjectOnboarding,
  PROJECT_ONBOARDING_COMPLETED_KEY,
} from "@/components/setup/project-onboarding";
import { Sidebar } from "./sidebar";
import { ProjectTitleBar } from "./title-bar";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

export function ProjectLayout() {
  const projectId = useActiveProjectId();
  const { data: project, isLoading, isError } = useProjectQuery(projectId);
  const settingsQuery = useSettingsQuery();
  const navigate = useNavigate();
  const [terminalOpen] = useTerminalPanel();
  const touch = useTouchProject();

  // Dismiss the onboarding locally when it completes so the project
  // view renders immediately — the persistent flag also gets written
  // by the wizard, so subsequent navigations skip it.
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  useRunnerListener();
  useGitListener();

  // Update lastOpenedAt whenever a project is entered so the dashboard
  // always sorts by most recently accessed.
  useEffect(() => {
    if (projectId) touch.mutate(projectId);
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcut: Ctrl+` / Cmd+` to toggle terminal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        useUiStore.getState().toggleTerminal();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Project not found — navigate home
  useEffect(() => {
    if (isError) {
      navigate("/", { replace: true });
    }
  }, [isError]);

  const isReady = !!project && !isLoading;
  const settingsReady = !settingsQuery.isLoading && !!settingsQuery.data;
  const onboardingCompleted =
    !!settingsQuery.data?.[PROJECT_ONBOARDING_COMPLETED_KEY];
  const showOnboarding =
    isReady && settingsReady && !onboardingCompleted && !onboardingDismissed;

  if (!isReady) {
    return (
      <Root>
        <ProjectTitleBar />
        <Body>
          <Sidebar />
          <Main>
            <Content />
          </Main>
        </Body>
      </Root>
    );
  }

  // Early-return the onboarding when it should show — the project
  // chrome (title bar, sidebar, runner dock) is hidden while the
  // wizard is up so there's a single, focused surface on screen.
  if (showOnboarding && project) {
    return (
      <ProjectOnboarding
        project={project}
        onComplete={() => setOnboardingDismissed(true)}
        onClose={() => navigate("/", { replace: true })}
      />
    );
  }

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
