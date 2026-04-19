import type { ReactNode } from "react";

export type StepStatus = "pending" | "active" | "done" | "error";

export interface WizardStep {
  /** Stable key — routes changes without re-mounting the whole wizard. */
  id: string;
  /** Short title shown in the rail and at the top of the content pane. */
  title: string;
  /** One-line hint shown under the title in the rail. */
  hint?: string;
  /** Longer description rendered above the step body. */
  description?: string;
  /** If true, this step is optional (user can Skip). */
  optional?: boolean;
  /** Current status — the shell uses this for the rail indicators. */
  status: StepStatus;
  /** Step body. Receives the shell's action registry so it can wire Next. */
  render: () => ReactNode;
  /** Optional full-bleed backdrop rendered behind the content pane. */
  backdrop?: () => ReactNode;
  /** If false, the Next button is disabled until the step declares ready. */
  canAdvance?: boolean;
  /** If true, hide the Back button on this step. */
  hideBack?: boolean;
  /** Override the Next label. */
  nextLabel?: string;
}
