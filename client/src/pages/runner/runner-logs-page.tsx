import { useOutletContext } from "react-router-dom";
import { RunnerLogs } from "./components/logs";
import { useActiveService } from "./hooks/use-active-service";
import { useActiveProjectId } from "@/api/hooks/_shared";

interface RunnerOutletContext {
  previewToggle: React.ReactNode;
}

export function RunnerLogsPage() {
  const projectId = useActiveProjectId();
  const { activeId } = useActiveService();
  const { previewToggle } = useOutletContext<RunnerOutletContext>();

  return (
    <RunnerLogs
      projectId={projectId!}
      activeConfigId={activeId}
      toolbarTrailing={previewToggle}
    />
  );
}
