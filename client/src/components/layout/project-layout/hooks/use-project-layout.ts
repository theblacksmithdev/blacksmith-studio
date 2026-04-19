import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectQuery, useTouchProject } from "@/api/hooks/projects";
import { useSettingsQuery } from "@/api/hooks/settings";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { PROJECT_ONBOARDING_COMPLETED_KEY } from "@/components/setup/project-onboarding";
import type { Project } from "@/api/types";

/**
 * Discriminated union over the four things the project layout can
 * show. Each variant that carries `project` guarantees it's non-null,
 * so consumers never need to re-check.
 */
export type ProjectLayoutPhase =
  | { kind: "loading" }
  | { kind: "onboarding"; project: Project }
  | { kind: "ready"; project: Project };

export interface UseProjectLayoutResult {
  phase: ProjectLayoutPhase;
  /** Called by the onboarding when the user finishes / explicitly skips. */
  markOnboardingDismissed: () => void;
  /** Called by the onboarding close button — navigates out of the project. */
  exitProject: () => void;
}

/**
 * Computes which shell to render and owns the side effects that must
 * fire for *any* phase (touch on enter, navigate-home on error).
 *
 * Returns a `phase` the layout pattern-matches on — no nested ifs, no
 * redundant nil-checks.
 */
export function useProjectLayout(): UseProjectLayoutResult {
  const projectId = useActiveProjectId();
  const projectQuery = useProjectQuery(projectId);
  const settingsQuery = useSettingsQuery();
  const navigate = useNavigate();
  const touch = useTouchProject();

  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  // Reset the in-memory dismiss when the project changes — each project
  // makes its own decision about whether to skip onboarding.
  useEffect(() => {
    setOnboardingDismissed(false);
  }, [projectId]);

  // Update lastOpenedAt whenever a project is entered so the dashboard
  // sorts by most recently accessed.
  useEffect(() => {
    if (projectId) touch.mutate(projectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Project not found — bounce home.
  useEffect(() => {
    if (projectQuery.isError) {
      navigate("/", { replace: true });
    }
  }, [projectQuery.isError, navigate]);

  const phase = useMemo<ProjectLayoutPhase>(() => {
    const project = projectQuery.data;
    if (!project || projectQuery.isLoading) return { kind: "loading" };

    // Wait for settings before deciding onboarding — avoids flicker
    // where the ready chrome mounts for a beat, then swaps to wizard.
    if (settingsQuery.isLoading || !settingsQuery.data) {
      return { kind: "loading" };
    }

    const completed =
      !!settingsQuery.data[PROJECT_ONBOARDING_COMPLETED_KEY];
    if (!completed && !onboardingDismissed) {
      return { kind: "onboarding", project };
    }
    return { kind: "ready", project };
  }, [
    projectQuery.data,
    projectQuery.isLoading,
    settingsQuery.data,
    settingsQuery.isLoading,
    onboardingDismissed,
  ]);

  const markOnboardingDismissed = useCallback(
    () => setOnboardingDismissed(true),
    [],
  );
  const exitProject = useCallback(
    () => navigate("/", { replace: true }),
    [navigate],
  );

  return { phase, markOnboardingDismissed, exitProject };
}
