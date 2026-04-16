import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export const MIN_PYTHON_VERSION = "3.10";

export interface PythonInstallation {
  label: string;
  path: string;
  version: string;
}

function getPythonVersion(pythonBinary: string): string | null {
  try {
    const output = execSync(`"${pythonBinary}" --version 2>&1`, {
      timeout: 5000,
      shell: "/bin/sh",
    });
    return output
      .toString()
      .trim()
      .replace(/^Python\s*/i, "");
  } catch {
    return null;
  }
}

function meetsMinimum(version: string): boolean {
  const parts = version.split(".").map(Number);
  const min = MIN_PYTHON_VERSION.split(".").map(Number);
  if (parts[0] > min[0]) return true;
  if (parts[0] === min[0] && parts[1] >= min[1]) return true;
  return false;
}

function findPyenvVersions(): PythonInstallation[] {
  const pyenvRoot =
    process.env.PYENV_ROOT || path.join(os.homedir(), ".pyenv");
  const versionsDir = path.join(pyenvRoot, "versions");
  if (!fs.existsSync(versionsDir)) return [];

  const results: PythonInstallation[] = [];
  try {
    const dirs = fs.readdirSync(versionsDir);
    for (const dir of dirs) {
      const pythonBin = path.join(versionsDir, dir, "bin", "python3");
      if (!fs.existsSync(pythonBin)) continue;
      const version = getPythonVersion(pythonBin);
      if (version && meetsMinimum(version)) {
        results.push({
          label: `pyenv ${version}`,
          path: pythonBin,
          version,
        });
      }
    }
  } catch {
    /* ignore */
  }
  return results;
}

function findCondaEnvs(): PythonInstallation[] {
  const candidates = [
    path.join(os.homedir(), "miniconda3", "envs"),
    path.join(os.homedir(), "anaconda3", "envs"),
    path.join(os.homedir(), "miniforge3", "envs"),
  ];

  // Also check conda base environments
  const baseCandidates = [
    path.join(os.homedir(), "miniconda3", "bin", "python3"),
    path.join(os.homedir(), "anaconda3", "bin", "python3"),
    path.join(os.homedir(), "miniforge3", "bin", "python3"),
  ];

  const results: PythonInstallation[] = [];

  // Base conda installs
  for (const pythonBin of baseCandidates) {
    if (!fs.existsSync(pythonBin)) continue;
    const version = getPythonVersion(pythonBin);
    if (version && meetsMinimum(version)) {
      const distro = pythonBin.includes("miniconda")
        ? "Miniconda"
        : pythonBin.includes("miniforge")
          ? "Miniforge"
          : "Anaconda";
      results.push({
        label: `${distro} (${version})`,
        path: pythonBin,
        version,
      });
    }
  }

  // Named conda environments
  for (const envsDir of candidates) {
    if (!fs.existsSync(envsDir)) continue;
    try {
      for (const dir of fs.readdirSync(envsDir)) {
        const pythonBin = path.join(envsDir, dir, "bin", "python3");
        if (!fs.existsSync(pythonBin)) continue;
        const version = getPythonVersion(pythonBin);
        if (version && meetsMinimum(version)) {
          results.push({
            label: `conda:${dir} (${version})`,
            path: pythonBin,
            version,
          });
        }
      }
    } catch {
      /* ignore */
    }
  }

  return results;
}

function findSystemPython(): PythonInstallation | null {
  const candidates = [
    "/opt/homebrew/bin/python3",
    "/usr/local/bin/python3",
    "/usr/bin/python3",
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const version = getPythonVersion(candidate);
    if (version && meetsMinimum(version)) {
      const label = candidate.includes("homebrew")
        ? `Homebrew (${version})`
        : `System (${version})`;
      return { label, path: candidate, version };
    }
  }
  return null;
}

function findWhichPython(): PythonInstallation | null {
  try {
    const pythonPath = execSync("which python3", {
      timeout: 5000,
      encoding: "utf-8",
    }).trim();
    if (pythonPath && fs.existsSync(pythonPath)) {
      const version = getPythonVersion(pythonPath);
      if (version && meetsMinimum(version)) {
        return { label: `Default (${version})`, path: pythonPath, version };
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function detectPythonInstallations(): PythonInstallation[] {
  const seen = new Set<string>();
  const results: PythonInstallation[] = [];

  const add = (install: PythonInstallation) => {
    try {
      const resolved = fs.realpathSync(install.path);
      if (!seen.has(resolved)) {
        seen.add(resolved);
        results.push(install);
      }
    } catch {
      /* skip unresolvable symlinks */
    }
  };

  // Default (what's on PATH) first
  const defaultPython = findWhichPython();
  if (defaultPython) add(defaultPython);

  // pyenv versions
  for (const p of findPyenvVersions()) add(p);

  // conda environments
  for (const p of findCondaEnvs()) add(p);

  // System-installed python
  const systemPython = findSystemPython();
  if (systemPython) add(systemPython);

  return results;
}
