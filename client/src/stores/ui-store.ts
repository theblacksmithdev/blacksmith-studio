import { create } from 'zustand'

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'

interface UiState {
  connectionStatus: ConnectionStatus
  setConnectionStatus: (status: ConnectionStatus) => void

  runnerPanelOpen: boolean
  setRunnerPanelOpen: (open: boolean) => void

  previewOpen: boolean
  setPreviewOpen: (open: boolean) => void

  sidebarExpanded: boolean
  setSidebarExpanded: (expanded: boolean) => void
  toggleSidebar: () => void

  historyPanelOpen: boolean
  setHistoryPanelOpen: (open: boolean) => void
  toggleHistoryPanel: () => void

  terminalOpen: boolean
  setTerminalOpen: (open: boolean) => void
  toggleTerminal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  connectionStatus: 'disconnected',
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  runnerPanelOpen: false,
  setRunnerPanelOpen: (runnerPanelOpen) => set({ runnerPanelOpen }),

  previewOpen: false,
  setPreviewOpen: (previewOpen) => set({ previewOpen }),

  sidebarExpanded: false,
  setSidebarExpanded: (sidebarExpanded) => set({ sidebarExpanded }),
  toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),

  historyPanelOpen: false,
  setHistoryPanelOpen: (historyPanelOpen) => set({ historyPanelOpen }),
  toggleHistoryPanel: () => set((s) => ({ historyPanelOpen: !s.historyPanelOpen })),

  terminalOpen: false,
  setTerminalOpen: (terminalOpen) => set({ terminalOpen }),
  toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),
}))
