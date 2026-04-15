import { useUiStore } from "@/stores/ui-store";

/**
 * Manages the toggle state for the history and preview side panels.
 */
export function useChatPanels() {
  const previewOpen = useUiStore((s) => s.previewOpen);
  const setPreviewOpen = useUiStore((s) => s.setPreviewOpen);
  const historyOpen = useUiStore((s) => s.historyPanelOpen);
  const toggleHistory = useUiStore((s) => s.toggleHistoryPanel);

  const togglePreview = () => setPreviewOpen(!previewOpen);
  const closePreview = () => setPreviewOpen(false);

  return {
    previewOpen,
    historyOpen,
    togglePreview,
    toggleHistory,
    closePreview,
  };
}
