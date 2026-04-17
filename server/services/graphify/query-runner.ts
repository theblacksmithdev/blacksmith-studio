import type { PythonManager } from "../python/index.js";
import { BIN_NAME, QUERY_TIMEOUT_MS } from "./constants.js";

/**
 * Runs `graphify query` against a project's built graph.
 *
 * Single Responsibility: question-in, answer-out. Throws a readable error
 * rather than returning null — callers never have to distinguish "CLI ran
 * and returned nothing" from "CLI failed to run".
 */
export class QueryRunner {
  constructor(private readonly python: PythonManager) {}

  async query(projectRoot: string, question: string): Promise<string> {
    const output = await this.python.packages.run(
      BIN_NAME,
      ["query", question],
      { cwd: projectRoot, timeout: QUERY_TIMEOUT_MS },
    );
    if (output === null) throw new Error("Query failed");
    return output;
  }
}
