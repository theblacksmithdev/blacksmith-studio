import fs from "node:fs";
import path from "node:path";
import type { BuildProgress, BuildCheckpoint } from "./types.js";

const CHECKPOINT_FILENAME = ".blacksmith-studio/build-checkpoint.json";

/** Save build state to disk so it can be resumed later. */
export function saveCheckpoint(
  progress: BuildProgress,
  projectRoot: string,
): void {
  const checkpoint: BuildCheckpoint = {
    buildId: progress.id,
    plan: progress.plan,
    results: Object.fromEntries(progress.results),
    buildContext: progress.buildContext,
    currentPhase: progress.currentPhase + 1, // resume from NEXT phase
    totalCostUsd: progress.totalCostUsd,
    totalDurationMs: progress.totalDurationMs,
    startedAt: progress.startedAt,
  };

  const dir = path.join(projectRoot, ".blacksmith-studio");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(projectRoot, CHECKPOINT_FILENAME),
    JSON.stringify(checkpoint, null, 2),
    "utf-8",
  );
}

/** Load a checkpoint from disk. Returns null if none exists. */
export function loadCheckpoint(projectRoot: string): BuildCheckpoint | null {
  const checkpointPath = path.join(projectRoot, CHECKPOINT_FILENAME);
  if (!fs.existsSync(checkpointPath)) return null;
  return JSON.parse(fs.readFileSync(checkpointPath, "utf-8"));
}

/** Delete the checkpoint file after a successful build. */
export function deleteCheckpoint(projectRoot: string): void {
  const checkpointPath = path.join(projectRoot, CHECKPOINT_FILENAME);
  if (fs.existsSync(checkpointPath)) {
    try {
      fs.unlinkSync(checkpointPath);
    } catch {
      /* ok */
    }
  }
}
