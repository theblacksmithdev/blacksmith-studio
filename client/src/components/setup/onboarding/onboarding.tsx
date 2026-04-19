import { useMemo } from "react";
import { Wizard, type WizardStep } from "@/components/shared/wizard";
import { StudioBackground } from "@/components/shared/studio-background";
import {
  ClaudeAuthStep,
  ClaudeCliStep,
  DoneStep,
  NodeStep,
  PythonEnvStep,
  PythonStep,
  WelcomeStep,
} from "./steps";
import { useOnboarding } from "./hooks";

interface OnboardingProps {
  onComplete: () => void;
}

/**
 * First-run setup flow. Presentational shell only — all state and IPC
 * plumbing lives in `useOnboarding()` (see ./hooks). This file just
 * builds the step list from the hook's output and renders the Wizard.
 */
export function Onboarding({ onComplete }: OnboardingProps) {
  const ob = useOnboarding({ onComplete });

  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "welcome",
        title: "Welcome to Blacksmith Studio",
        hint: "A quick tour of what's about to happen.",
        description:
          "We'll set up everything you need to build — Node.js, Python, the Claude Code CLI, and a dedicated Studio environment. Takes a couple of minutes.",
        status: ob.statusFor("welcome"),
        canAdvance: ob.canAdvance.welcome,
        render: () => <WelcomeStep />,
        backdrop: () => <StudioBackground />,
      },
      {
        id: "node",
        title: "Node.js",
        hint: "Pick the runtime Blacksmith should use.",
        description:
          "Blacksmith shells out to Node for the runner and package tasks. Pick any installed version — we recommend 20 or newer — or browse to a custom binary.",
        status: ob.statusFor("node"),
        canAdvance: ob.canAdvance.node,
        render: () => (
          <NodeStep
            value={ob.state.nodePath}
            version={ob.state.nodeVersion}
            onPick={ob.handlers.pickNode}
          />
        ),
      },
      {
        id: "python",
        title: "Python",
        hint: "Pick the interpreter for the Studio environment.",
        description:
          "Some features (like Graphify) run Python. Pick an interpreter 3.10 or newer. uv is bundled, so no pip bootstrap is required.",
        status: ob.statusFor("python"),
        canAdvance: ob.canAdvance.python,
        render: () => (
          <PythonStep
            value={ob.state.pythonPath}
            version={ob.state.pythonVersion}
            onPick={ob.handlers.pickPython}
          />
        ),
      },
      {
        id: "python-env",
        title: "Studio environment",
        hint: "Build the dedicated venv.",
        description:
          "We'll create a virtual environment at ~/.blacksmith-studio/venv using the interpreter you picked. All Python-backed features install their dependencies into this venv.",
        status: ob.statusFor("python-env"),
        canAdvance: ob.canAdvance["python-env"],
        render: () => (
          <PythonEnvStep
            pythonPath={ob.state.pythonPath}
            onReady={ob.handlers.markPythonEnvReady}
          />
        ),
      },
      {
        id: "claude-cli",
        title: "Claude Code CLI",
        hint: ob.claude.installed ? "Installed" : "Required",
        description:
          "Blacksmith delegates to the Claude Code CLI for every agent and chat turn. We can install it for you with a single click.",
        status: ob.statusFor("claude-cli"),
        canAdvance: ob.canAdvance["claude-cli"],
        render: () => (
          <ClaudeCliStep
            installed={ob.claude.installed}
            version={ob.claude.version}
            onChange={ob.handlers.recheckClaude}
          />
        ),
      },
      {
        id: "claude-auth",
        title: "Sign in to Claude",
        hint: ob.claude.authenticated ? "Authenticated" : "Run `claude login`",
        description:
          "Claude Code manages its own authentication. Run the login command in your terminal, then come back and hit Re-check.",
        status: ob.statusFor("claude-auth"),
        canAdvance: ob.canAdvance["claude-auth"],
        optional: true,
        render: () => (
          <ClaudeAuthStep
            authenticated={ob.claude.authenticated}
            onRecheck={ob.handlers.recheckClaude}
          />
        ),
      },
      {
        id: "done",
        title: "You're all set",
        hint: "Time to build.",
        description:
          "Your forge is ready. Open the app and start a new project — Blacksmith will pick up all of these choices.",
        status: ob.statusFor("done"),
        canAdvance: ob.canAdvance.done,
        nextLabel: "Enter Blacksmith",
        render: () => (
          <DoneStep
            nodeVersion={ob.state.nodeVersion ?? undefined}
            claudeVersion={ob.claude.version}
            pythonPath={ob.state.pythonPath}
          />
        ),
      },
    ],
    [ob],
  );

  return (
    <Wizard
      brandTitle="Blacksmith Studio"
      brandCaption="First-time setup"
      steps={steps}
      currentStepId={ob.current}
      onBack={ob.goBack}
      onNext={ob.goNext}
      onSkip={ob.goSkip}
    />
  );
}
