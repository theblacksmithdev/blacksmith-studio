import fs from "node:fs";
import path from "node:path";
import type { RunnerConfigInput } from "./runner-config.js";

type DetectedRunner = Partial<RunnerConfigInput> & {
  name: string;
  command: string;
};

/**
 * Smart-detect runnable services in a project directory.
 * Returns suggested runner configs based on files found.
 */
export function detectRunners(projectRoot: string): DetectedRunner[] {
  const runners: DetectedRunner[] = [];
  const exists = (rel: string) => fs.existsSync(path.join(projectRoot, rel));
  const readJson = (rel: string) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(projectRoot, rel), "utf-8"));
    } catch {
      return null;
    }
  };

  // ── Blacksmith fullstack project ──
  if (exists("blacksmith.config.json")) {
    const config = readJson("blacksmith.config.json") ?? {};

    if (exists("backend/manage.py")) {
      runners.push({
        name: "Backend",
        command: "python manage.py runserver 0.0.0.0:{port} --noreload",
        setupCommand: exists("backend/requirements.txt")
          ? "pip install -r requirements.txt"
          : null,
        cwd: "backend",
        port: config.backend?.port ?? 8000,
        env: { PYTHONUNBUFFERED: "1", STUDIO_EMBED: "1" },
        previewUrl: "http://localhost:{port}/api/docs",
        icon: "server",
        readyPattern: "Watching for|Starting development",
        autoDetected: true,
        sortOrder: 0,
      });
    }

    if (exists("frontend/package.json")) {
      const yarnFe = exists("frontend/yarn.lock");
      runners.push({
        name: "Frontend",
        command: "npm run dev -- --port {port}",
        setupCommand: yarnFe ? "yarn install" : "npm install",
        cwd: "frontend",
        port: config.frontend?.port ?? 5173,
        env: { FORCE_COLOR: "0" },
        previewUrl: "http://localhost:{port}/",
        icon: "globe",
        readyPattern: "Local:|ready|VITE",
        autoDetected: true,
        sortOrder: 1,
      });
    }

    if (runners.length > 0) return runners;
  }

  const hasYarn = exists("yarn.lock");
  const hasPnpm = exists("pnpm-lock.yaml");
  const installCmd = hasPnpm
    ? "pnpm install"
    : hasYarn
      ? "yarn install"
      : "npm install";

  // ── Next.js ──
  if (
    exists("next.config.js") ||
    exists("next.config.mjs") ||
    exists("next.config.ts")
  ) {
    runners.push({
      name: "Next.js",
      command: "npm run dev -- --port {port}",
      setupCommand: installCmd,
      port: 3000,
      env: { FORCE_COLOR: "0" },
      previewUrl: "http://localhost:{port}/",
      icon: "globe",
      readyPattern: "ready|Local:",
      autoDetected: true,
      sortOrder: 0,
    });
    return runners;
  }

  // ── Vite (standalone) ──
  if (
    exists("vite.config.ts") ||
    exists("vite.config.js") ||
    exists("vite.config.mjs")
  ) {
    runners.push({
      name: "Vite",
      command: "npm run dev -- --port {port}",
      setupCommand: installCmd,
      port: 5173,
      env: { FORCE_COLOR: "0" },
      previewUrl: "http://localhost:{port}/",
      icon: "globe",
      readyPattern: "Local:|VITE",
      autoDetected: true,
      sortOrder: 0,
    });
    return runners;
  }

  // ── Django (standalone) ──
  if (exists("manage.py")) {
    const venvPython = exists("venv/bin/python")
      ? "venv/bin/python"
      : exists(".venv/bin/python")
        ? ".venv/bin/python"
        : "python";
    runners.push({
      name: "Django",
      command: `${venvPython} manage.py runserver 0.0.0.0:{port} --noreload`,
      setupCommand: exists("requirements.txt")
        ? "pip install -r requirements.txt"
        : null,
      port: 8000,
      env: { PYTHONUNBUFFERED: "1" },
      previewUrl: "http://localhost:{port}/",
      icon: "server",
      readyPattern: "Watching for|Starting development",
      autoDetected: true,
      sortOrder: 0,
    });
    return runners;
  }

  // ── Flask ──
  if ((exists("app.py") || exists("main.py")) && hasFlaskImport(projectRoot)) {
    runners.push({
      name: "Flask",
      command: "python app.py",
      port: 5000,
      env: { FLASK_DEBUG: "1", PYTHONUNBUFFERED: "1" },
      previewUrl: "http://localhost:{port}/",
      icon: "server",
      readyPattern: "Running on",
      autoDetected: true,
      sortOrder: 0,
    });
    return runners;
  }

  // ── Go ──
  if (exists("go.mod")) {
    runners.push({
      name: "Go",
      command: "go run .",
      setupCommand: "go mod download",
      port: 8080,
      icon: "terminal",
      readyPattern: "Listening|listening|started",
      autoDetected: true,
      sortOrder: 0,
    });
    return runners;
  }

  // ── Rust ──
  if (exists("Cargo.toml")) {
    runners.push({
      name: "Rust",
      command: "cargo run",
      setupCommand: "cargo build",
      port: 8080,
      icon: "terminal",
      readyPattern: "listening|Listening|started",
      autoDetected: true,
      sortOrder: 0,
    });
    return runners;
  }

  // ── Docker Compose ──
  if (
    exists("docker-compose.yml") ||
    exists("docker-compose.yaml") ||
    exists("compose.yml")
  ) {
    runners.push({
      name: "Docker Compose",
      command: "docker compose up",
      icon: "container",
      autoDetected: true,
      sortOrder: 0,
    });
    return runners;
  }

  // ── Generic package.json scripts ──
  const pkg = readJson("package.json");
  if (pkg?.scripts) {
    if (pkg.scripts.dev) {
      runners.push({
        name: "Dev Server",
        command: "npm run dev",
        setupCommand: installCmd,
        port: 3000,
        env: { FORCE_COLOR: "0" },
        previewUrl: "http://localhost:{port}/",
        icon: "globe",
        readyPattern: "ready|Local:|listening|Started",
        autoDetected: true,
        sortOrder: 0,
      });
    } else if (pkg.scripts.start) {
      runners.push({
        name: "Server",
        command: "npm start",
        setupCommand: installCmd,
        port: 3000,
        icon: "globe",
        readyPattern: "listening|ready|started",
        autoDetected: true,
        sortOrder: 0,
      });
    }
  }

  return runners;
}

function hasFlaskImport(projectRoot: string): boolean {
  for (const file of ["app.py", "main.py"]) {
    try {
      const content = fs.readFileSync(path.join(projectRoot, file), "utf-8");
      if (content.includes("flask") || content.includes("Flask")) return true;
    } catch {
      /* skip */
    }
  }
  return false;
}
