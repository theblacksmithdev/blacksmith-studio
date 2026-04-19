"use strict";

/**
 * electron-builder `afterPack` hook.
 *
 * Restores the executable bit on bundled Mach-O binaries shipped via
 * npm packages. During the universal-app merge (and, anecdotally, on
 * cross-arch force-installs) the +x mode can be stripped from files
 * under `app.asar.unpacked/`, yielding EACCES when we try to spawn
 * them at runtime.
 *
 * Runs once per intermediate app (x64 and arm64) before universal
 * merging, and once more for the merged universal app. Idempotent:
 * re-chmod of an already-executable file is a no-op. macOS only —
 * Windows and Linux bundle their own binaries via different channels
 * and don't go through this merge step.
 */

const fs = require("node:fs");
const path = require("node:path");

/** Paths (relative to `app.asar.unpacked/`) that must be executable. */
const BUNDLED_EXECUTABLES = [
  "node_modules/@manzt/uv-darwin-x64/bin/uv",
  "node_modules/@manzt/uv-darwin-arm64/bin/uv",
  "node_modules/node-pty/prebuilds/darwin-x64/spawn-helper",
  "node_modules/node-pty/prebuilds/darwin-arm64/spawn-helper",
];

/** electron-builder invokes the default export. */
exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;

  const productFilename = context.packager.appInfo.productFilename;
  const unpackedRoot = path.join(
    context.appOutDir,
    `${productFilename}.app`,
    "Contents",
    "Resources",
    "app.asar.unpacked",
  );

  for (const relPath of BUNDLED_EXECUTABLES) {
    const abs = path.join(unpackedRoot, relPath);
    if (!fs.existsSync(abs)) continue;
    fs.chmodSync(abs, 0o755);
  }
};
