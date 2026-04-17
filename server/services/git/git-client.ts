import simpleGit, { type SimpleGit } from "simple-git";

/**
 * Factory that resolves a project path to a SimpleGit handle.
 *
 * Single Responsibility: git handle construction. Services depend on
 * this class (not on `simple-git` directly) so the `simpleGit(...)`
 * call is isolated to one place.
 */
export class GitClient {
  of(projectPath: string): SimpleGit {
    return simpleGit(projectPath);
  }
}
