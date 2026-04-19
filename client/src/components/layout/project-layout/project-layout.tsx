import { useRunnerListener } from "@/hooks/use-runner";
import { useGitListener } from "@/hooks/use-git";
import { ProjectOnboarding } from "@/components/setup/project-onboarding";
import { useProjectLayout, useTerminalShortcut } from "./hooks";
import { ProjectLayoutLoading } from "./project-layout-loading";
import { ProjectLayoutReady } from "./project-layout-ready";

/**
 * Thin orchestrator. Fires the project-wide side-effects (runner/git
 * listeners, keyboard shortcut), then pattern-matches on the phase
 * returned by `useProjectLayout` to pick one of three mutually
 * exclusive views. No runtime nil checks — the hook's discriminated
 * union guarantees `project` is present on the branches that need it.
 */
export function ProjectLayout() {
  const { phase, markOnboardingDismissed, exitProject } = useProjectLayout();

  useRunnerListener();
  useGitListener();
  useTerminalShortcut();

  switch (phase.kind) {
    case "loading":
      return <ProjectLayoutLoading />;
    case "onboarding":
      return (
        <ProjectOnboarding
          project={phase.project}
          onComplete={markOnboardingDismissed}
          onClose={exitProject}
        />
      );
    case "ready":
      return <ProjectLayoutReady />;
  }
}
