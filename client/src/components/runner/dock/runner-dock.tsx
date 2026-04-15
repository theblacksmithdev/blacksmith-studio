import { useLocation } from "react-router-dom";
import {
  useRunnerStore,
  useServices,
  selectIsAnyActive,
  selectRunningCount,
  RunnerStatus,
} from "@/stores/runner-store";
import { useUiStore } from "@/stores/ui-store";
import { DockFab } from "./dock-fab";
import { DockPanel } from "./dock-panel";

export function RunnerDock() {
  const open = useUiStore((s) => s.runnerPanelOpen);
  const setOpen = useUiStore((s) => s.setRunnerPanelOpen);
  const location = useLocation();

  const anyActive = useRunnerStore(selectIsAnyActive);
  const starting = useServices(RunnerStatus.Starting);
  const activeCount = useRunnerStore(selectRunningCount);

  const isOnRunPage = location.pathname.includes("/run");
  if (isOnRunPage || !anyActive) return null;

  if (!open) {
    return (
      <DockFab
        starting={starting.length > 0}
        title={`${activeCount} server${activeCount > 1 ? "s" : ""} running`}
        onClick={() => setOpen(true)}
      />
    );
  }

  return <DockPanel onClose={() => setOpen(false)} />;
}
