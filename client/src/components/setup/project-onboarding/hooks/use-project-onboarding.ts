import { useCallback, useMemo, useState } from "react";
import {
  useSettingsQuery,
  useUpdateSettings,
} from "@/api/hooks/settings";
import { useActiveProjectId } from "@/api/hooks/_shared";
import type { StepStatus } from "@/components/shared/wizard";

export type ProjectOnboardingStepId =
  | "welcome"
  | "runner"
  | "graphify"
  | "done";

export const PROJECT_ONBOARDING_STEP_ORDER: ProjectOnboardingStepId[] = [
  "welcome",
  "runner",
  "graphify",
  "done",
];

/** Key used in project-scoped settings to gate this flow. */
export const PROJECT_ONBOARDING_COMPLETED_KEY = "project.onboarding.completed";

export interface UseProjectOnboardingOptions {
  /** Called after the flow completes (or is dismissed) — host un-mounts. */
  onComplete: () => void;
}

/**
 * Per-project first-open flow state + navigation.
 *
 * Mirrors `useOnboarding` (global) — same shape, different steps. The
 * flag `project.onboarding.completed` lives in project-scoped SQLite
 * settings so each project's "seen the tour" state is independent.
 */
export function useProjectOnboarding({
  onComplete,
}: UseProjectOnboardingOptions) {
  const projectId = useActiveProjectId();
  const settingsQuery = useSettingsQuery();
  const updateSettings = useUpdateSettings();

  const [current, setCurrent] = useState<ProjectOnboardingStepId>("welcome");

  const completed = !!settingsQuery.data?.[PROJECT_ONBOARDING_COMPLETED_KEY];
  const loadingGate = settingsQuery.isLoading;

  const currentIndex = useMemo(
    () => PROJECT_ONBOARDING_STEP_ORDER.indexOf(current),
    [current],
  );

  const statusFor = useCallback(
    (step: ProjectOnboardingStepId): StepStatus => {
      const stepIndex = PROJECT_ONBOARDING_STEP_ORDER.indexOf(step);
      if (stepIndex < currentIndex) return "done";
      if (stepIndex === currentIndex) return "active";
      return "pending";
    },
    [currentIndex],
  );

  const markCompleted = useCallback(() => {
    if (!projectId) {
      onComplete();
      return;
    }
    updateSettings.mutate(
      { [PROJECT_ONBOARDING_COMPLETED_KEY]: true },
      { onSuccess: () => onComplete() },
    );
  }, [projectId, updateSettings, onComplete]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrent(PROJECT_ONBOARDING_STEP_ORDER[currentIndex - 1]);
    }
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (current === "done") {
      markCompleted();
      return;
    }
    if (currentIndex < PROJECT_ONBOARDING_STEP_ORDER.length - 1) {
      setCurrent(PROJECT_ONBOARDING_STEP_ORDER[currentIndex + 1]);
    }
  }, [current, currentIndex, markCompleted]);

  const goSkip = useCallback(() => {
    if (currentIndex < PROJECT_ONBOARDING_STEP_ORDER.length - 1) {
      setCurrent(PROJECT_ONBOARDING_STEP_ORDER[currentIndex + 1]);
    }
  }, [currentIndex]);

  /** Dismiss the whole flow — persists the completed flag so it doesn't re-fire. */
  const dismiss = useCallback(() => {
    markCompleted();
  }, [markCompleted]);

  return {
    projectId,
    current,
    loadingGate,
    completed,
    statusFor,
    goBack,
    goNext,
    goSkip,
    dismiss,
  };
}
