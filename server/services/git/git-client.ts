import simpleGit, { type SimpleGit } from "simple-git";

/**
 * Abstracts the creation of a SimpleGit handle.
 *
 * Single Responsibility: resolve a project path to a git handle.
 * Dependency Inversion: services depend on this interface rather than the
 * `simple-git` package directly, so tests can inject a mock factory.
 */
export interface IGitClient {
  /** Obtain a SimpleGit instance bound to a project directory. */
  of(projectPath: string): SimpleGit;
}

/** Default production implementation — delegates straight to `simple-git`. */
export class GitClient implements IGitClient {
  of(projectPath: string): SimpleGit {
    return simpleGit(projectPath);
  }
}
