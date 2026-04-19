import { useMemo } from "react";
import { Button } from "@/components/shared/ui";
import { Wizard, type WizardStep } from "@/components/shared/wizard";
import { StudioBackground } from "@/components/shared/studio-background";
import type { Project } from "@/api/types";
import {
  DoneStep,
  GraphifyStep,
  RunnerStep,
  WelcomeStep,
} from "./steps";
import {
  useProjectGraphifySetup,
  useProjectOnboarding,
  useProjectRunnerSetup,
} from "./hooks";

interface ProjectOnboardingProps {
  project: Project;
  /** Fires when the user finishes ("Enter project") or explicitly
   *  skips via "Set up later". Flag is persisted so onboarding won't
   *  re-fire for this project. */
  onComplete: () => void;
  /** Fires when the user hits the top-right close button. Does NOT
   *  persist the flag — caller decides what happens next (e.g.
   *  navigate back to the projects list). */
  onClose: () => void;
}

/**
 * Per-project first-open wizard. Same shell as the global onboarding
 * (`Wizard` + step hooks) so the visual language is consistent. The
 * flag that gates this view (`project.onboarding.completed`) is
 * persisted via `useProjectOnboarding`.
 */
export function ProjectOnboarding({
  project,
  onComplete,
  onClose,
}: ProjectOnboardingProps) {
  const ob = useProjectOnboarding({ onComplete });
  const runner = useProjectRunnerSetup();
  const graphify = useProjectGraphifySetup();

  const steps: WizardStep[] = useMemo(
    () => [
      {
        id: "welcome",
        title: "Welcome to your project",
        hint: "A quick tour of what's about to happen.",
        description:
          "We'll set up the few things Blacksmith needs to work well with this project. Takes a minute; everything is optional.",
        status: ob.statusFor("welcome"),
        canAdvance: true,
        render: () => <WelcomeStep project={project} />,
        backdrop: () => <StudioBackground />,
      },
      {
        id: "runner",
        title: "Run your project",
        hint: "How should Blacksmith start it?",
        description:
          "Point Blacksmith at your dev server — npm run dev, python app.py, or any custom command — so you can launch it right from the runner dock.",
        status: ob.statusFor("runner"),
        canAdvance: true,
        optional: true,
        render: () => <RunnerStep projectId={ob.projectId} />,
      },
      {
        id: "graphify",
        title: "Knowledge graph",
        hint: "Give agents structural context.",
        description:
          "Graphify extracts a lightweight map of your repo so agents see structure instead of raw files — dramatically fewer tokens, sharper answers.",
        status: ob.statusFor("graphify"),
        canAdvance: true,
        optional: true,
        render: () => <GraphifyStep />,
      },
      {
        id: "done",
        title: "You're all set",
        hint: "Open your project.",
        description:
          "Your project is ready to go. You can revisit any of these choices from Settings at any time.",
        status: ob.statusFor("done"),
        canAdvance: true,
        nextLabel: "Open project",
        render: () => (
          <DoneStep
            projectName={project.name}
            runnerConfigured={runner.hasConfigs}
            graphifyReady={graphify.exists}
          />
        ),
        backdrop: () => <StudioBackground />,
      },
    ],
    [project, ob, runner.hasConfigs, graphify.exists],
  );

  return (
    <Wizard
      brandTitle={project.name}
      brandCaption="Project setup"
      steps={steps}
      currentStepId={ob.current}
      onBack={ob.goBack}
      onNext={ob.goNext}
      onSkip={ob.goSkip}
      onClose={onClose}
      footerExtra={
        ob.current !== "done" && (
          <Button variant="ghost" size="md" onClick={ob.dismiss}>
            Set up later
          </Button>
        )
      }
    />
  );
}
