import detect from "detect-port";

/**
 * Asserts that the given port is free. Throws a user-facing error if it's busy.
 * Uses detect-port which works reliably across macOS, Windows, and Linux.
 */
export async function assertPortAvailable(port: number): Promise<void> {
  const available = await detect(port);
  if (available !== port) {
    throw new Error(
      `Port ${port} is already in use. Update the port in your runner config and try again.`,
    );
  }
}

/**
 * Extracts a port number from a line of process output.
 * Matches patterns like:
 *   - http://localhost:3000
 *   - http://127.0.0.1:5173
 *   - http://0.0.0.0:8000
 *   - port 3000
 *   - Port: 3000
 */
export function extractPortFromLine(line: string): number | null {
  // Match URLs: http(s)://host:PORT
  const urlMatch = line.match(
    /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]):(\d{2,5})/,
  );
  if (urlMatch) return parseInt(urlMatch[1], 10);

  // Match "port NNNN" or "Port: NNNN"
  const portMatch = line.match(/\bport[:\s]+(\d{2,5})\b/i);
  if (portMatch) return parseInt(portMatch[1], 10);

  return null;
}
