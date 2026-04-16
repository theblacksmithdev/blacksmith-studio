import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { createNdjsonParser } from "../../claude/ndjson-parser.js";
import { nodeEnv } from "../../node-env.js";
import type { AgentExecuteOptions } from "../base/index.js";
import type { AgentRole, AgentEvent } from "../types.js";

/* ── Task Plan Types ── */

export type TaskModel = "fast" | "balanced" | "premium";

/**
 * Review level determines how much quality gate scrutiny a task receives.
 * - 'none': Skip quality gate entirely (specs, docs, trivial changes)
 * - 'light': One review pass, no test cycle (simple renames, config changes)
 * - 'full': Full review + test cycles (features, complex logic, security-critical code)
 */
export type ReviewLevel = "none" | "light" | "full";

export interface DispatchTask {
  id: string;
  title: string;
  /** Brief description of what this task delivers */
  description: string;
  role: AgentRole;
  prompt: string;
  /** IDs of tasks this depends on (must complete first) */
  dependsOn: string[];
  /** AI model selected by PM based on task complexity */
  model: TaskModel;
  /** How much quality gate scrutiny this task needs */
  reviewLevel: ReviewLevel;
}

export interface DispatchPlan {
  /** 'single' = one agent, 'multi' = ordered tasks, 'clarification' = PM needs more info */
  mode: "single" | "multi" | "clarification";
  /** For single mode: the one task to execute */
  task?: DispatchTask;
  /** For multi mode: ordered task list */
  tasks: DispatchTask[];
  /** Brief explanation of the plan, or the PM's question for clarification mode */
  summary: string;
}

/* ── System Prompt ── */

const PM_SYSTEM_PROMPT = `You are the lead project manager for a software team. Analyze the user's request and produce an intelligent task plan. You HAVE access to the filesystem — use Read, Glob, and Grep tools to understand the codebase before planning. Read key files like CLAUDE.md, theme files, component barrel exports, and package.json to understand the project's architecture, design system, and conventions before decomposing tasks.

## Available Team (organized by department)

### Product & Strategy
The decision-maker and requirement owner. Drives priorities.
- product-manager: Requirements analysis, task breakdown, acceptance criteria, prioritization.

### Architecture & Infrastructure
Owns the technical foundation — system design, data layer, and deployment pipeline. Works first, before any code is written.
- architect: System design, module boundaries, technical decisions, ADRs.
- database-engineer: Data models, migrations, schema design, indexes, query optimization.
- devops-engineer: Docker, CI/CD, deployment, infrastructure.

### Engineering
The core builders. UI/UX feeds into Frontend, while Backend and Fullstack bridge both worlds.
- backend-engineer: Django, Python, API endpoints, serializers, views, services, middleware.
- frontend-engineer: React, TypeScript, components, hooks, pages, state management, styling. IMPLEMENTS code from UI/UX specs.
- fullstack-engineer: ONLY for tiny cross-stack changes (renaming a field across both stacks). Never for feature work.
- ui-designer: Produces complete, self-contained HTML/CSS design artifacts as handoff for the frontend-engineer. Discovers the project's design tokens first, then builds working HTML/CSS files with all component states, responsive behaviour, and accessibility. Includes HTML comments marking component boundaries and a Frontend Engineer Handoff Notes block. The frontend-engineer converts these into the project's frontend framework.

### Quality & Assurance
Acts as a gate before anything ships. Reviews correctness, security vulnerabilities, and test coverage.
- qa-engineer: Tests (unit, integration, E2E), test strategy, coverage.
- code-reviewer: Code review, quality audit.
- security-engineer: Security audit, vulnerability fixes, auth hardening, OWASP.

### Documentation
Maintains technical documentation and developer guides.
- technical-writer: Documentation, README, API docs, code comments.

## How to Think About Task Sizing

Your goal is to give each agent a task they can do EXCELLENTLY — not a task so big they rush through it, and not so small it's trivial overhead.

Ask yourself for each task: "Can the agent produce complete, production-quality code for this in one focused pass?" If the answer is "they'd have to cut corners," the task is too big — split it further.

IMPORTANT: Agents will execute your tasks exactly as given. They will NOT break tasks down further. If you give a task that's too big, the agent will produce rushed, incomplete code. YOU are solely responsible for proper task sizing.

**One task = one logical unit of work.** A model and its migration is one unit. One API endpoint with its serializer and URL wiring is one unit. One page component is one unit. One test file covering one feature is one unit.

**Adapt to complexity.** A simple "add a field to the User model" is a single task. "Build user authentication with registration, login, password reset, email verification, and role-based access" is 8-12 tasks. Don't apply the same split to both.

**The frontend ALWAYS follows a UI design artifact.** If a feature has ANY UI work, you MUST include a ui-designer task BEFORE the frontend-engineer task. The ui-designer produces a complete HTML/CSS file showing the exact visual design, all component states, responsive behaviour, and accessibility — with HTML comments marking component boundaries and a handoff notes block. The frontend-engineer then converts this HTML/CSS into the project's frontend framework. NEVER skip this step — even for "simple" UI changes. A designer producing a working visual reference always produces better output than a frontend engineer guessing.

## Artifact Handoff System

When agents complete their work, their output is automatically saved as an artifact file at .blacksmith/artifacts/{role}/{taskId}-{slug}.md. The next agent in the chain receives the file path and is instructed to READ it before starting.

**This means:**
- The ui-designer's HTML/CSS design artifact is persisted as an artifact file.
- The frontend-engineer's prompt MUST instruct them to read the artifact: "Read the HTML/CSS design artifact at the path provided by the previous task before implementing."
- The architect's design decisions are similarly persisted for downstream engineers.
- Each agent has access to the FULL, untruncated output of previous agents through these files.

**In your task prompts, explicitly tell agents to read the artifact:**
- For frontend tasks after design: "Read the HTML/CSS design artifact from the UI/UX designer. Convert it into the project's frontend framework exactly as designed — use the HTML comments for component boundaries and the handoff notes for props, interactions, and token mappings."
- For backend tasks after architecture: "Read the architecture artifact to understand the system design before implementing."
- For QA tasks: "Read the previous artifacts to understand what was built and write tests accordingly."

## Critical Rules
1. Simple requests (one role, one deliverable) → mode: "single", one task.
2. Multi-concern requests → mode: "multi", STRICT SERIAL ORDER. Every task depends on the previous.
3. Natural ordering: database → backend → ui-designer (spec) → frontend (implements spec) → qa → security → docs. Only include the layers the request actually needs.
4. Task prompts must be SPECIFIC. Name exact files, fields, endpoints, components. Reference what previous tasks created by file path.
5. The frontend-engineer's prompt MUST say "Read the HTML/CSS design artifact from the previous task. Use the HTML comments for component boundaries and the handoff notes for props, interactions, and token mappings. Convert it into the project's frontend framework exactly as designed."
6. Never assign feature work to fullstack-engineer.
7. Each task's prompt should tell the agent exactly what files to read, what to create, and what the output should look like.
8. Only include QA, security, or docs tasks when the request warrants them. A simple model change doesn't need a security audit.

## Model Selection

Each task must include a "model" field. Choose the tier based on the complexity and stakes of that specific task:

- **"premium"** — Deep reasoning, complex architecture, security-critical code, intricate multi-file changes, complex UI components with many states.
- **"balanced"** — The default. Standard implementation: features, components, API endpoints, tests, docs. **Always use balanced or premium for frontend-engineer and ui-designer tasks** — they require strong design reasoning.
- **"fast"** — Simple, mechanical tasks: renaming, config changes, adding a single field. **Never use fast for frontend or design tasks.**

**Default to "balanced"** when unsure. Default to **"balanced" or "premium"** for any UI/frontend work.

## Review Level

Each task must include a "reviewLevel" field. This controls how much quality gate scrutiny the task receives after execution:

- **"none"** — Skip quality gate entirely. Use for: spec-only roles (ui-designer, architect, technical-writer, product-manager), documentation, config-only changes, and non-code tasks.
- **"light"** — One review pass, no test cycle. Use for: simple renames, small config changes, straightforward additions, single-file edits with low risk.
- **"full"** — Full review + test cycles. Use for: new features, complex logic, security-critical code, multi-file changes, database migrations, API changes.

**Guidelines:**
- Spec/design tasks are ALWAYS "none" — they produce specifications, not code.
- Simple one-file changes → "light".
- Anything touching auth, payments, data models, or multi-file features → "full".
- Default to "full" when unsure — it's safer to over-review than under-review.

## Output Format
Respond with ONLY a JSON object. No markdown fences, no explanation.

{
  "mode": "single" | "multi",
  "task": { "id": "t1", "title": "...", "description": "...", "role": "...", "prompt": "...", "dependsOn": [], "model": "balanced", "reviewLevel": "full" },
  "tasks": [
    { "id": "t1", "title": "...", "description": "...", "role": "...", "prompt": "...", "dependsOn": [], "model": "balanced", "reviewLevel": "none" },
    { "id": "t2", "title": "...", "description": "...", "role": "...", "prompt": "...", "dependsOn": ["t1"], "model": "fast", "reviewLevel": "light" }
  ],
  "summary": "Brief description of the plan"
}

For "single" mode, populate "task" and set "tasks" to [].
For "multi" mode, populate "tasks" with each task depending on the previous (strict serial).`;

const VALID_ROLES = new Set<string>([
  "frontend-engineer",
  "backend-engineer",
  "fullstack-engineer",
  "devops-engineer",
  "qa-engineer",
  "security-engineer",
  "database-engineer",
  "ui-designer",
  "technical-writer",
  "code-reviewer",
  "architect",
  "product-manager",
]);

type EmitFn = (event: AgentEvent) => void;

/**
 * Use the PM agent (via Claude) to decompose a prompt into a task plan.
 * Streams activity/message events in real-time via the emit callback.
 */
export async function dispatchWithPM(
  prompt: string,
  baseOptions: Omit<AgentExecuteOptions, "prompt">,
  emit?: EmitFn,
): Promise<DispatchPlan> {
  const claudeBin = baseOptions.claudeBin ?? "claude";

  const args = [
    "-p",
    `Analyze this request and produce a task plan:\n\n${prompt}`,
    "--output-format",
    "stream-json",
    "--verbose",
    "--permission-mode",
    "bypassPermissions",
    "--allowedTools",
    "Read,Glob,Grep",
    "--append-system-prompt",
    PM_SYSTEM_PROMPT,
  ];

  const fullText = await new Promise<string>((resolve, reject) => {
    const proc = spawn(claudeBin, args, {
      cwd: baseOptions.projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: nodeEnv(baseOptions.nodePath),
    });

    let text = "";
    let stderr = "";
    let firstChunkEmitted = false;

    const emitPM = (
      type: AgentEvent["data"]["type"],
      data: Record<string, any>,
    ) => {
      if (!emit) return;
      emit({
        type: type as AgentEvent["type"],
        agentId: "product-manager",
        executionId: "",
        timestamp: new Date().toISOString(),
        data: { type, ...data } as AgentEvent["data"],
      });
    };

    const parser = createNdjsonParser((chunk: any) => {
      if (chunk.type === "assistant") {
        for (const b of chunk.message?.content || []) {
          if (b.type === "text") {
            text += b.text;

            // Emit status on first chunk
            if (!firstChunkEmitted) {
              firstChunkEmitted = true;
              emitPM("status", {
                status: "executing",
                message: "PM is planning tasks...",
              });
            }

            // Stream partial text as message events
            emitPM("message", {
              content: b.text,
              isPartial: !chunk.stop_reason,
            });
          }
        }
      } else if (chunk.type === "result") {
        emitPM("activity", {
          description: `Plan complete — parsing ${text.length} chars`,
        });
      }
    });

    proc.stdout!.on("data", (d: Buffer) => parser.write(d.toString()));
    proc.stderr!.on("data", (d: Buffer) => {
      const chunk = d.toString();
      stderr += chunk;
      if (chunk.trim()) console.log(`[pm-dispatcher] stderr: ${chunk.trim()}`);
    });

    proc.on("close", (code, signal) => {
      parser.flush();

      // If killed by signal (e.g. SIGTERM), try to use whatever text we collected
      if (signal) {
        if (text.trim()) {
          console.warn(
            `[pm-dispatcher] Process killed by ${signal}, using partial response`,
          );
          resolve(text);
        } else {
          reject(
            new Error(
              `PM dispatch killed by ${signal} before producing output`,
            ),
          );
        }
        return;
      }

      if (code !== 0 && code !== null) {
        // Non-zero exit but we have text — try to use it (Claude sometimes exits 1 with valid output)
        if (text.trim()) {
          console.warn(
            `[pm-dispatcher] Exit code ${code} but has output, attempting to parse`,
          );
          resolve(text);
        } else {
          reject(
            new Error(stderr.trim() || `PM dispatch exited with code ${code}`),
          );
        }
      } else {
        resolve(text);
      }
    });

    proc.on("error", (err) =>
      reject(new Error(`PM dispatch spawn failed: ${err.message}`)),
    );
  });

  if (!fullText.trim()) {
    throw new Error(
      "PM returned empty response — Claude CLI may not have produced output",
    );
  }

  console.log(
    `[pm-dispatcher] Raw response (${fullText.length} chars): ${fullText.slice(0, 500)}...`,
  );
  return parsePlan(fullText);
}

/* ── Two-Phase PM: Task Refinement ── */

const REFINE_SYSTEM_PROMPT = `You are the lead project manager refining a task prompt. A previous planning phase produced a rough task assignment. Now that earlier agents have completed their work and produced artifacts, you must refine this task's prompt to be specific and grounded in what was actually produced.

## Your Job
1. READ the actual artifact files from previous agents using the Read tool. Do not just reference file paths — read the content.
2. Rewrite the task prompt so it references the ACTUAL outputs — exact file paths, component names, field names, design tokens, and decisions from the artifacts.
3. The agent executing this task will also receive the artifact file paths to read. Your refined prompt should tell them WHAT to focus on and HOW the artifacts relate to their task.

## Rules
- Keep the same role and goal — don't change what the task is, just make it more specific.
- Reference concrete details from artifacts: exact field names, component names, file paths, API endpoints, design tokens, layout decisions.
- If a design spec exists, tell the implementer to follow it exactly — name the specific components, states, and tokens from the spec.
- If an architecture artifact exists, reference the module boundaries, data flow, and interface contracts it defined.
- Be concise. Don't pad with generic advice the agent already knows.

## Output
Respond with ONLY the refined task prompt text. No JSON, no markdown fences, no explanation — just the prompt the agent should receive.`;

/**
 * Two-phase PM refinement: refine a task's prompt using artifacts from completed tasks.
 *
 * Called before each task in the pipeline (when artifacts exist) to replace the
 * PM's original speculative prompt with one grounded in actual agent output.
 * This is a fast, lightweight call — no tools, short response.
 */
export async function refineTaskPrompt(
  task: DispatchTask,
  artifactSummaries: { role: string; artifactPath: string; title: string }[],
  baseOptions: Omit<AgentExecuteOptions, "prompt">,
  emit?: EmitFn,
): Promise<string> {
  // No artifacts to refine against — use original prompt
  if (artifactSummaries.length === 0) return task.prompt;

  const claudeBin = baseOptions.claudeBin ?? "claude";

  const artifactContext = artifactSummaries
    .map(
      (a) =>
        `- ${a.role} completed "${a.title}" → artifact at: ${a.artifactPath}`,
    )
    .join("\n");

  const refinementPrompt = [
    `Refine this task prompt for the ${task.role}:`,
    "",
    "## Original Task",
    `Title: ${task.title}`,
    `Role: ${task.role}`,
    `Prompt: ${task.prompt}`,
    "",
    "## Completed Artifacts (from earlier agents)",
    artifactContext,
    "",
    "Rewrite the task prompt to be specific and grounded in these artifacts.",
  ].join("\n");

  const args = [
    "-p",
    refinementPrompt,
    "--output-format",
    "stream-json",
    "--verbose",
    "--permission-mode",
    "bypassPermissions",
    "--allowedTools",
    "Read,Glob,Grep",
    "--append-system-prompt",
    REFINE_SYSTEM_PROMPT,
  ];

  const emitPM = (description: string) => {
    if (!emit) return;
    emit({
      type: "activity" as AgentEvent["type"],
      agentId: "product-manager",
      executionId: "",
      timestamp: new Date().toISOString(),
      data: { type: "activity", description } as AgentEvent["data"],
    });
  };

  emitPM(
    `Refining task "${task.title}" with ${artifactSummaries.length} artifact(s)...`,
  );

  try {
    const fullText = await new Promise<string>((resolve, reject) => {
      const proc = spawn(claudeBin, args, {
        cwd: baseOptions.projectRoot,
        stdio: ["ignore", "pipe", "pipe"],
        env: nodeEnv(baseOptions.nodePath),
      });

      let text = "";
      let stderr = "";

      const parser = createNdjsonParser((chunk: any) => {
        if (chunk.type === "assistant") {
          for (const b of chunk.message?.content || []) {
            if (b.type === "text") text += b.text;
          }
        }
      });

      proc.stdout!.on("data", (d: Buffer) => parser.write(d.toString()));
      proc.stderr!.on("data", (d: Buffer) => {
        stderr += d.toString();
      });

      proc.on("close", (code: number | null) => {
        parser.flush();
        if (text.trim()) resolve(text.trim());
        else if (code !== 0)
          reject(
            new Error(stderr.trim() || `Refinement exited with code ${code}`),
          );
        else resolve("");
      });

      proc.on("error", (err: Error) => reject(err));
    });

    if (fullText) {
      console.log(
        `[pm-dispatcher] Refined task "${task.title}" (${fullText.length} chars)`,
      );
      emitPM(`Task "${task.title}" refined with artifact context`);
      return fullText;
    }
  } catch (err: any) {
    console.warn(
      `[pm-dispatcher] Refinement failed for "${task.title}", using original prompt:`,
      err.message,
    );
    emitPM(`Refinement failed — using original prompt for "${task.title}"`);
  }

  // Fallback to original prompt if refinement fails
  return task.prompt;
}

/* ── Adaptive Re-Planning After Spec Tasks ── */

const REPLAN_SYSTEM_PROMPT = `You are the lead PM re-evaluating a task plan. A spec-producing agent just completed their work and saved an artifact. Read the artifact to understand what was actually produced, then re-decompose the remaining tasks to be properly sized.

## Rules
1. READ the artifact file using the Read tool — do not guess at its contents.
2. Re-decompose any task that's too large based on what the artifact actually specifies.
3. Each engineering task should be ONE focused deliverable (one component, one API endpoint, one migration).
4. Adjust model selections: use "balanced" or "premium" for complex work, never "fast" for frontend/design.
5. Preserve non-engineering tasks (QA, security, docs) at the end.
6. Keep the same overall goal — just size tasks properly based on the real spec.
7. Set dependsOn so tasks execute serially — each depends on the previous.

## Output
Respond with ONLY a JSON array of task objects. No markdown, no explanation.
[
  { "id": "t1", "title": "...", "description": "...", "role": "...", "prompt": "...", "dependsOn": [], "model": "balanced", "reviewLevel": "full" },
  ...
]`;

/**
 * Re-plan downstream tasks after a spec-producing agent completes.
 * PM reads the artifact and re-decomposes remaining tasks based on actual output.
 * Returns new task list to replace remaining unexecuted tasks.
 * Falls back to original remaining tasks on failure.
 */
export async function replanDownstream(
  completedTask: DispatchTask,
  artifactPath: string,
  remainingTasks: DispatchTask[],
  baseOptions: Omit<AgentExecuteOptions, "prompt">,
  emit?: EmitFn,
): Promise<DispatchTask[]> {
  if (remainingTasks.length === 0) return [];

  const claudeBin = baseOptions.claudeBin ?? "claude";

  const remainingDesc = remainingTasks
    .map(
      (t, i) =>
        `${i + 1}. [${t.role}] "${t.title}": ${t.prompt.slice(0, 200)}...`,
    )
    .join("\n");

  const replanPrompt = [
    `A ${completedTask.role} just completed "${completedTask.title}".`,
    `Their output artifact is at: ${artifactPath}`,
    `Read that file to understand what was produced.`,
    "",
    `The remaining tasks in the pipeline are:`,
    remainingDesc,
    "",
    `Based on the ACTUAL artifact content, re-decompose these remaining tasks.`,
    `Split any oversized tasks into focused subtasks. Adjust model selections.`,
    `Each task prompt must tell the agent exactly what to build and reference the artifact.`,
  ].join("\n");

  const args = [
    "-p",
    replanPrompt,
    "--output-format",
    "stream-json",
    "--verbose",
    "--permission-mode",
    "bypassPermissions",
    "--allowedTools",
    "Read,Glob,Grep",
    "--append-system-prompt",
    REPLAN_SYSTEM_PROMPT,
  ];

  const emitPM = (description: string) => {
    if (!emit) return;
    emit({
      type: "activity" as AgentEvent["type"],
      agentId: "product-manager",
      executionId: "",
      timestamp: new Date().toISOString(),
      data: { type: "activity", description } as AgentEvent["data"],
    });
  };

  emitPM(
    `Re-evaluating plan after ${completedTask.role} completed "${completedTask.title}"...`,
  );

  try {
    const fullText = await new Promise<string>((resolve, reject) => {
      const proc = spawn(claudeBin, args, {
        cwd: baseOptions.projectRoot,
        stdio: ["ignore", "pipe", "pipe"],
        env: nodeEnv(baseOptions.nodePath),
      });

      let text = "";
      let stderr = "";

      const parser = createNdjsonParser((chunk: any) => {
        if (chunk.type === "assistant") {
          for (const b of chunk.message?.content || []) {
            if (b.type === "text") text += b.text;
          }
        }
      });

      proc.stdout!.on("data", (d: Buffer) => parser.write(d.toString()));
      proc.stderr!.on("data", (d: Buffer) => {
        stderr += d.toString();
      });

      proc.on("close", (code: number | null) => {
        parser.flush();
        if (text.trim()) resolve(text.trim());
        else if (code !== 0)
          reject(
            new Error(stderr.trim() || `Re-plan exited with code ${code}`),
          );
        else resolve("");
      });

      proc.on("error", (err: Error) => reject(err));
    });

    if (!fullText) {
      emitPM("Re-plan returned empty — keeping original tasks");
      return remainingTasks;
    }

    // Parse JSON array from response
    const bracketStart = fullText.indexOf("[");
    const bracketEnd = fullText.lastIndexOf("]");

    if (bracketStart === -1 || bracketEnd <= bracketStart) {
      console.warn(
        "[pm-dispatcher] Re-plan: no JSON array found, keeping original tasks",
      );
      emitPM("Re-plan did not produce valid tasks — keeping original plan");
      return remainingTasks;
    }

    const parsed = JSON.parse(fullText.slice(bracketStart, bracketEnd + 1));
    if (!Array.isArray(parsed) || parsed.length === 0) {
      emitPM("Re-plan returned empty array — keeping original plan");
      return remainingTasks;
    }

    const prefix = crypto.randomUUID().slice(0, 8);
    const VALID_ROLES = new Set<string>([
      "frontend-engineer",
      "backend-engineer",
      "fullstack-engineer",
      "devops-engineer",
      "qa-engineer",
      "security-engineer",
      "database-engineer",
      "ui-designer",
      "technical-writer",
      "code-reviewer",
      "architect",
      "product-manager",
    ]);
    const VALID_MODELS = new Set<TaskModel>(["fast", "balanced", "premium"]);
    const VALID_REVIEW_LEVELS = new Set<ReviewLevel>(["none", "light", "full"]);

    const newTasks: DispatchTask[] = parsed
      .map((t: any, i: number) => {
        const id = `${prefix}-r${i}`;
        return {
          id,
          title: t.title ?? `Task ${i + 1}`,
          description: t.description ?? "",
          role: VALID_ROLES.has(t.role) ? t.role : "frontend-engineer",
          prompt: t.prompt ?? "",
          dependsOn: i > 0 ? [`${prefix}-r${i - 1}`] : [completedTask.id],
          model: VALID_MODELS.has(t.model) ? t.model : "balanced",
          reviewLevel: VALID_REVIEW_LEVELS.has(t.reviewLevel)
            ? t.reviewLevel
            : "full",
        };
      })
      .filter((t: DispatchTask) => t.prompt.trim());

    if (newTasks.length === 0) {
      emitPM("Re-plan produced no valid tasks — keeping original plan");
      return remainingTasks;
    }

    emitPM(
      `Re-plan: ${remainingTasks.length} tasks → ${newTasks.length} tasks`,
    );
    console.log(
      `[pm-dispatcher] Re-plan: ${remainingTasks.length} → ${newTasks.length} tasks`,
    );
    return newTasks;
  } catch (err: any) {
    console.warn(
      "[pm-dispatcher] Re-plan failed, keeping original tasks:",
      err.message,
    );
    emitPM(`Re-plan failed — continuing with original plan`);
    return remainingTasks;
  }
}

function parsePlan(raw: string): DispatchPlan {
  const braceStart = raw.indexOf("{");
  const braceEnd = raw.lastIndexOf("}");

  // No JSON found — the PM is asking a clarification question or responding conversationally
  if (braceStart === -1 || braceEnd <= braceStart) {
    console.log(
      `[pm-dispatcher] No JSON in response — treating as clarification`,
    );
    return {
      mode: "clarification",
      tasks: [],
      summary: raw.trim(),
    };
  }

  const candidate = raw.slice(braceStart, braceEnd + 1);

  let parsed: any;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    // JSON-like braces found but invalid JSON — also treat as clarification
    console.log(
      `[pm-dispatcher] JSON parse failed — treating as clarification`,
    );
    return {
      mode: "clarification",
      tasks: [],
      summary: raw.trim(),
    };
  }

  const mode = parsed.mode === "single" ? "single" : "multi";
  const summary = parsed.summary ?? "";

  // Generate a dispatch prefix so task IDs are globally unique across dispatches
  const prefix = crypto.randomUUID().slice(0, 8);
  const idMap = new Map<string, string>(); // original PM id → globally unique id

  function validateTask(task: any, index: number): DispatchTask {
    if (!task.role || !VALID_ROLES.has(task.role)) {
      throw new Error(`Task ${index}: invalid role "${task.role}"`);
    }
    if (!task.prompt) {
      throw new Error(`Task ${index}: missing prompt`);
    }
    const originalId = task.id ?? `t${index}`;
    const uniqueId = `${prefix}-${originalId}`;
    idMap.set(originalId, uniqueId);

    const VALID_MODELS = new Set<TaskModel>(["fast", "balanced", "premium"]);
    const model = VALID_MODELS.has(task.model) ? task.model : "balanced";

    const VALID_REVIEW_LEVELS = new Set<ReviewLevel>(["none", "light", "full"]);
    const reviewLevel = VALID_REVIEW_LEVELS.has(task.reviewLevel)
      ? task.reviewLevel
      : "full";

    return {
      id: uniqueId,
      title: task.title ?? `Task ${index + 1}`,
      description: task.description ?? "",
      role: task.role as AgentRole,
      prompt: task.prompt,
      dependsOn: Array.isArray(task.dependsOn) ? task.dependsOn : [],
      model,
      reviewLevel,
    };
  }

  if (mode === "single" && parsed.task) {
    const task = validateTask(parsed.task, 0);
    return { mode: "single", task, tasks: [task], summary };
  }

  const tasks = (parsed.tasks || []).map((t: any, i: number) =>
    validateTask(t, i),
  );

  // Remap dependency references from PM's original IDs to our globally unique IDs
  for (const task of tasks) {
    task.dependsOn = task.dependsOn
      .map((dep: string) => {
        const mapped = idMap.get(dep);
        if (!mapped) {
          console.warn(
            `[pm-dispatcher] Task "${task.id}" references unknown dep "${dep}", removing`,
          );
          return null;
        }
        return mapped;
      })
      .filter(Boolean) as string[];
  }

  if (tasks.length === 0) {
    throw new Error("PM produced an empty task plan");
  }

  if (tasks.length === 1) {
    return { mode: "single", task: tasks[0], tasks, summary };
  }

  return { mode: "multi", tasks, summary };
}
