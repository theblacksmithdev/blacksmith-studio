import { api as raw } from "../client";

export interface PythonInstallation {
  label: string;
  path: string;
  version: string;
}

export interface PythonCheckResult {
  installed: boolean;
  version?: string;
  meetsMinimum: boolean;
  venvReady: boolean;
}

export interface PythonSetupResult {
  success: boolean;
  error?: string;
}

export const python = {
  detect: () => raw.invoke<PythonInstallation[]>("python:detect"),
  check: (projectId?: string) =>
    raw.invoke<PythonCheckResult>("python:check", projectId ? { projectId } : undefined),
  setupVenv: (projectId?: string) =>
    raw.invoke<PythonSetupResult>("python:setupVenv", projectId ? { projectId } : undefined),
  resetVenv: () => raw.invoke<void>("python:resetVenv"),
  installPackage: (pkg: string) =>
    raw.invoke<PythonSetupResult>("python:installPackage", { pkg }),
  isPackageInstalled: (pkg: string) =>
    raw.invoke<boolean>("python:isPackageInstalled", { pkg }),
  onProgress: (cb: (data: { line: string }) => void) =>
    raw.subscribe("python:onProgress", cb),
} as const;
