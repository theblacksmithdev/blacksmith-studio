import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useGlobalSettingsQuery,
  useUpdateGlobalSettings,
} from "@/api/hooks/settings";
import { useSetupCheckQuery } from "@/api/hooks/setup";
import type { StepStatus } from "@/components/shared/wizard";
import { isNodeVersionValid, isPythonVersionValid } from "@/constants";

export type OnboardingStepId =
  | "welcome"
  | "node"
  | "python"
  | "python-env"
  | "claude-cli"
  | "claude-auth"
  | "done";

export const ONBOARDING_STEP_ORDER: OnboardingStepId[] = [
  "welcome",
  "node",
  "python",
  "python-env",
  "claude-cli",
  "claude-auth",
  "done",
];

export interface OnboardingState {
  nodePath: string | null;
  nodeVersion: string | null;
  pythonPath: string | null;
  pythonVersion: string | null;
  pythonEnvReady: boolean;
}

const INITIAL_STATE: OnboardingState = {
  nodePath: null,
  nodeVersion: null,
  pythonPath: null,
  pythonVersion: null,
  pythonEnvReady: false,
};

export interface UseOnboardingOptions {
  /** Called once the user confirms the final "Enter Blacksmith" step. */
  onComplete: () => void;
}

/**
 * All onboarding state + transitions in one hook.
 *
 * Owns cross-step state (picked bins, env-ready flag), derives claude
 * install/auth from the shared setup-check query cache, seeds stored
 * paths from global settings, and exposes navigation + per-step
 * handlers. The Onboarding component stays presentational — it
 * composes the Wizard with the values returned here.
 */
export function useOnboarding({ onComplete }: UseOnboardingOptions) {
  const [current, setCurrent] = useState<OnboardingStepId>("welcome");
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);

  const globalSettings = useGlobalSettingsQuery();
  const setupCheck = useSetupCheckQuery();
  const updateSettings = useUpdateGlobalSettings();

  const claudeInstalled = !!setupCheck.data?.claude.installed;
  const claudeVersion = setupCheck.data?.claude.version;
  const claudeAuthenticated = !!setupCheck.data?.auth.authenticated;

  // Seed paths from persisted global settings once they resolve. Only
  // runs while the local state is still empty so user picks made during
  // the flow aren't clobbered by a later query refresh.
  useEffect(() => {
    if (!globalSettings.data) return;
    setState((s) => ({
      ...s,
      nodePath: s.nodePath ?? (globalSettings.data["runner.nodePath"] || null),
      pythonPath:
        s.pythonPath ?? (globalSettings.data["python.pythonPath"] || null),
    }));
  }, [globalSettings.data]);

  const pickNode = useCallback(
    (path: string, version: string) => {
      setState((s) => ({ ...s, nodePath: path, nodeVersion: version }));
      updateSettings.mutate({ "runner.nodePath": path });
    },
    [updateSettings],
  );

  const pickPython = useCallback((path: string, version: string) => {
    setState((s) => ({ ...s, pythonPath: path, pythonVersion: version }));
  }, []);

  const markPythonEnvReady = useCallback(() => {
    setState((s) => ({ ...s, pythonEnvReady: true }));
  }, []);

  const recheckClaude = useCallback(() => {
    setupCheck.refetch();
  }, [setupCheck]);

  const statusFor = useCallback(
    (step: OnboardingStepId): StepStatus => {
      const currentIndex = ONBOARDING_STEP_ORDER.indexOf(current);
      const stepIndex = ONBOARDING_STEP_ORDER.indexOf(step);
      if (stepIndex < currentIndex) return "done";
      if (stepIndex === currentIndex) return "active";
      return "pending";
    },
    [current],
  );

  const currentIndex = useMemo(
    () => ONBOARDING_STEP_ORDER.indexOf(current),
    [current],
  );

  const canAdvance: Record<OnboardingStepId, boolean> = useMemo(
    () => ({
      welcome: true,
      node:
        !!state.nodePath &&
        !!state.nodeVersion &&
        isNodeVersionValid(state.nodeVersion),
      python:
        !!state.pythonPath &&
        !!state.pythonVersion &&
        isPythonVersionValid(state.pythonVersion),
      "python-env": state.pythonEnvReady,
      "claude-cli": claudeInstalled,
      "claude-auth": claudeAuthenticated,
      done: true,
    }),
    [state, claudeInstalled, claudeAuthenticated],
  );

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrent(ONBOARDING_STEP_ORDER[currentIndex - 1]);
    }
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (current === "done") {
      updateSettings.mutate(
        { "onboarding.completed": true },
        { onSuccess: () => onComplete() },
      );
      return;
    }
    if (currentIndex < ONBOARDING_STEP_ORDER.length - 1) {
      setCurrent(ONBOARDING_STEP_ORDER[currentIndex + 1]);
    }
  }, [current, currentIndex, onComplete, updateSettings]);

  const goSkip = useCallback(() => {
    if (currentIndex < ONBOARDING_STEP_ORDER.length - 1) {
      setCurrent(ONBOARDING_STEP_ORDER[currentIndex + 1]);
    }
  }, [currentIndex]);

  return {
    current,
    state,
    claude: {
      installed: claudeInstalled,
      version: claudeVersion,
      authenticated: claudeAuthenticated,
    },
    statusFor,
    canAdvance,
    handlers: {
      pickNode,
      pickPython,
      markPythonEnvReady,
      recheckClaude,
    },
    goBack,
    goNext,
    goSkip,
  };
}
