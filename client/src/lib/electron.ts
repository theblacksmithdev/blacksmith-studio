/**
 * Electron API bridge.
 * Available when running inside Electron via the preload script.
 */

interface ElectronAPI {
  selectFolder: () => Promise<string | null>;
  isElectron: boolean;
  getVersion: () => Promise<string>;
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  on: (channel: string, callback: (...args: any[]) => void) => () => void;
  setZoomLevel: (level: number) => void;
  getZoomLevel: () => number;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

/** Check if running inside Electron */
export function isElectron(): boolean {
  return !!window.electronAPI?.isElectron;
}

/** Open native folder picker. Returns path or null. Falls back to null in browser. */
export async function selectFolderNative(): Promise<string | null> {
  if (window.electronAPI) {
    return window.electronAPI.selectFolder();
  }
  return null;
}
