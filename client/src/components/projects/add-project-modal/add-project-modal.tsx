import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Modal, IconButton } from "@/components/shared/ui";
import { ChooseStep } from "./components/choose-step";
import { ImportStep } from "./components/import-step";
import { CreateStep } from "./components/create-step";
import { CloneStep } from "./components/clone-step";

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "choose" | "import" | "create" | "clone";

const TITLES: Record<Step, string> = {
  choose: "Add Project",
  import: "Import Existing",
  clone: "Clone from Git",
  create: "Create New",
};

const SUBTITLES: Record<Step, string> = {
  choose: "Import, clone, or create a new project",
  import: "Select your project folder",
  clone: "Clone a repository from a Git URL",
  create: "Scaffold a new project with AI support",
};

export function AddProjectModal({ open, onClose }: AddProjectModalProps) {
  const [step, setStep] = useState<Step>("choose");

  useEffect(() => {
    if (open) setStep("choose");
  }, [open]);

  if (!open) return null;

  return (
    <Modal
      title={TITLES[step]}
      subtitle={SUBTITLES[step]}
      onClose={onClose}
      width={step === "create" ? "700px" : "500px"}
      headerExtra={
        step !== "choose" ? (
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => setStep("choose")}
            aria-label="Back"
          >
            <ArrowLeft />
          </IconButton>
        ) : undefined
      }
    >
      {step === "choose" && (
        <ChooseStep
          onImport={() => setStep("import")}
          onCreate={() => setStep("create")}
          onClone={() => setStep("clone")}
        />
      )}
      {step === "import" && <ImportStep onClose={onClose} />}
      {step === "create" && <CreateStep onClose={onClose} />}
      {step === "clone" && <CloneStep onClose={onClose} />}
    </Modal>
  );
}
