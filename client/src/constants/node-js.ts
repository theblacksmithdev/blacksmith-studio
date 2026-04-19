export const MIN_NODE_MAJOR = 20;

/** Extract the major version number from a `--version` string like "v20.11.0". */
export function parseNodeMajor(version: string): number | null {
  const match = version.match(/v?(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/** Whether the given `--version` string meets `MIN_NODE_MAJOR`. */
export function isNodeVersionValid(version: string): boolean {
  const major = parseNodeMajor(version);
  return major !== null && major >= MIN_NODE_MAJOR;
}
