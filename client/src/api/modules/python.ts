import { api as raw } from "../client";

export interface PythonSetupResult {
  success: boolean;
  error?: string;
}

/**
 * Low-level Studio-venv pip ops. Venv lifecycle (create / reset /
 * detect) lives in `api.commands` — use `createEnv` / `deleteEnv`
 * with `scope: "studio"`.
 */
export const python = {
  installPackage: (pkg: string) =>
    raw.invoke<PythonSetupResult>("python:installPackage", { pkg }),
  isPackageInstalled: (pkg: string) =>
    raw.invoke<boolean>("python:isPackageInstalled", { pkg }),
  onProgress: (cb: (data: { line: string }) => void) =>
    raw.subscribe("python:onProgress", cb),
} as const;
