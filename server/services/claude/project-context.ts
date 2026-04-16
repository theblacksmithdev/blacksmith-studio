import fs from "node:fs";
import path from "node:path";
import { KnowledgeManager } from "../knowledge.js";
import { GraphifyManager } from "../graphify.js";

const knowledgeManager = new KnowledgeManager();
const graphifyManager = new GraphifyManager();

const IGNORE = new Set([
  "node_modules",
  ".git",
  "__pycache__",
  "venv",
  "dist",
  ".env",
  ".blacksmith-studio",
  ".claude",
  ".vscode",
  ".idea",
  "htmlcov",
  ".pytest_cache",
  ".mypy_cache",
  "build",
  "egg-info",
  "migrations",
  "static",
  "media",
  ".next",
  ".nuxt",
]);

const KEY_FILES = [
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "blacksmith.config.json",
  "CLAUDE.md",
  "README.md",
  "tsconfig.json",
  "vite.config.ts",
  "next.config.js",
  "manage.py",
  "settings.py",
  "urls.py",
];

const CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".css",
  ".html",
  ".json",
  ".yaml",
  ".yml",
]);

/**
 * Generate a compact project context snapshot that gives Claude
 * immediate understanding of the codebase without needing to scan.
 *
 * Automatically includes the Graphify knowledge graph report when available,
 * reducing tree depth since the graph already captures structure.
 */
export function generateProjectContext(projectRoot: string): string {
  const lines: string[] = [];

  // Inject graph report as a rich structural overview when available
  const graphReport = graphifyManager.getReport(projectRoot);
  if (graphReport) {
    lines.push("## Project Knowledge Graph\n");
    lines.push(graphReport);
    lines.push("");
  }

  // Directory tree — shallower when graph provides structure
  const treeDepth = graphReport ? 2 : 3;
  lines.push("## Project Structure\n```");
  buildTree(projectRoot, projectRoot, lines, 0, treeDepth);
  lines.push("```\n");

  // Read key config/context files
  const keyFileContents: string[] = [];
  for (const name of KEY_FILES) {
    const filePath = path.join(projectRoot, name);
    if (fs.existsSync(filePath)) {
      try {
        const stat = fs.statSync(filePath);
        if (stat.size > 8192) continue; // skip large files
        const content = fs.readFileSync(filePath, "utf-8").trim();
        keyFileContents.push(`### ${name}\n\`\`\`\n${content}\n\`\`\``);
      } catch {
        /* skip */
      }
    }
    // Also check common nested locations
    for (const sub of ["config", "backend", "server", "src"]) {
      const nested = path.join(projectRoot, sub, name);
      if (fs.existsSync(nested)) {
        try {
          const stat = fs.statSync(nested);
          if (stat.size > 8192) continue;
          const content = fs.readFileSync(nested, "utf-8").trim();
          keyFileContents.push(
            `### ${sub}/${name}\n\`\`\`\n${content}\n\`\`\``,
          );
        } catch {
          /* skip */
        }
      }
    }
  }

  if (keyFileContents.length > 0) {
    lines.push("## Key Files\n");
    lines.push(keyFileContents.join("\n\n"));
  }

  // Include project knowledge base docs
  const knowledge = knowledgeManager.getAllContent(projectRoot);
  if (knowledge) {
    lines.push("\n## Project Knowledge\n");
    lines.push(knowledge);
  }

  return lines.join("\n");
}

function buildTree(
  root: string,
  dir: string,
  lines: string[],
  depth: number,
  maxDepth: number,
) {
  if (depth > maxDepth) return;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  const filtered = entries
    .filter((e) => !e.name.startsWith(".") && !IGNORE.has(e.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  const indent = "  ".repeat(depth);

  for (const entry of filtered) {
    if (entry.isDirectory()) {
      lines.push(`${indent}${entry.name}/`);
      buildTree(root, path.join(dir, entry.name), lines, depth + 1, maxDepth);
    } else if (
      CODE_EXTENSIONS.has(path.extname(entry.name)) ||
      KEY_FILES.includes(entry.name)
    ) {
      lines.push(`${indent}${entry.name}`);
    }
  }
}

// Cache per project path to avoid regenerating on every message
const contextCache = new Map<string, { context: string; timestamp: number }>();
const CACHE_TTL = 60_000; // 1 minute

export function getProjectContext(projectRoot: string): string {
  const cached = contextCache.get(projectRoot);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.context;
  }

  const context = generateProjectContext(projectRoot);
  contextCache.set(projectRoot, { context, timestamp: Date.now() });
  return context;
}
