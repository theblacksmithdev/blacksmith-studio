export const MIN_PYTHON_MAJOR = 3;
export const MIN_PYTHON_MINOR = 10;

/**
 * Pull the first `MAJOR.MINOR` pair out of a version string. Handles the
 * usual shapes: "Python 3.12.1", "3.10", "v3.11.4", etc.
 */
export function parsePythonVersion(
  version: string,
): { major: number; minor: number } | null {
  const match = version.match(/(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
  };
}

/** Whether the given version string meets the minimum Python version. */
export function isPythonVersionValid(version: string): boolean {
  const parsed = parsePythonVersion(version);
  if (!parsed) return false;
  if (parsed.major > MIN_PYTHON_MAJOR) return true;
  if (parsed.major === MIN_PYTHON_MAJOR && parsed.minor >= MIN_PYTHON_MINOR) {
    return true;
  }
  return false;
}

/** Human-readable minimum, e.g. "3.10". */
export const MIN_PYTHON_LABEL = `${MIN_PYTHON_MAJOR}.${MIN_PYTHON_MINOR}`;
