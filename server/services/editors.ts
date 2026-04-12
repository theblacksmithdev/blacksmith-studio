import fs from 'node:fs'
import { exec, execSync } from 'node:child_process'

export interface DetectedEditor {
  id: string
  name: string
  /** The command used to launch this editor */
  command: string
}

interface EditorDef {
  id: string
  name: string
  /** CLI command name (e.g. 'code') */
  cli: string
  /** macOS .app bundle paths to check */
  appPaths: string[]
  /** String that must appear in the resolved CLI path to confirm identity */
  cliIdentifier?: string
}

const KNOWN_EDITORS: EditorDef[] = [
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    cli: 'code',
    appPaths: [
      '/Applications/Visual Studio Code.app',
      '/Applications/Visual Studio Code - Insiders.app',
    ],
    cliIdentifier: 'Visual Studio Code',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    cli: 'cursor',
    appPaths: ['/Applications/Cursor.app'],
    cliIdentifier: 'Cursor',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    cli: 'windsurf',
    appPaths: ['/Applications/Windsurf.app'],
    cliIdentifier: 'Windsurf',
  },
  {
    id: 'zed',
    name: 'Zed',
    cli: 'zed',
    appPaths: ['/Applications/Zed.app'],
  },
  {
    id: 'sublime',
    name: 'Sublime Text',
    cli: 'subl',
    appPaths: ['/Applications/Sublime Text.app'],
  },
  {
    id: 'webstorm',
    name: 'WebStorm',
    cli: 'webstorm',
    appPaths: ['/Applications/WebStorm.app'],
  },
  {
    id: 'intellij',
    name: 'IntelliJ IDEA',
    cli: 'idea',
    appPaths: [
      '/Applications/IntelliJ IDEA.app',
      '/Applications/IntelliJ IDEA CE.app',
    ],
  },
  {
    id: 'fleet',
    name: 'Fleet',
    cli: 'fleet',
    appPaths: ['/Applications/Fleet.app'],
  },
  {
    id: 'nova',
    name: 'Nova',
    cli: 'nova',
    appPaths: ['/Applications/Nova.app'],
  },
  {
    id: 'atom',
    name: 'Atom',
    cli: 'atom',
    appPaths: ['/Applications/Atom.app'],
  },
  {
    id: 'neovim',
    name: 'Neovim',
    cli: 'nvim',
    appPaths: [],
  },
  {
    id: 'vim',
    name: 'Vim',
    cli: 'vim',
    appPaths: [],
  },
  {
    id: 'emacs',
    name: 'Emacs',
    cli: 'emacs',
    appPaths: ['/Applications/Emacs.app'],
  },
]

/**
 * Resolve the real path of a CLI command and check if it truly
 * belongs to the expected editor (avoids `code` → Cursor symlink issues).
 */
function resolveCliOwner(cli: string, identifier?: string): boolean {
  try {
    const resolved = execSync(`which ${cli}`, { encoding: 'utf-8' }).trim()
    if (!resolved) return false

    // If no identifier needed, CLI existing is enough
    if (!identifier) return true

    // Follow symlinks to the real path and check it contains the identifier
    const real = execSync(`readlink -f "${resolved}" 2>/dev/null || realpath "${resolved}" 2>/dev/null || echo "${resolved}"`, { encoding: 'utf-8' }).trim()
    return real.includes(identifier)
  } catch {
    return false
  }
}

function findApp(paths: string[]): string | null {
  for (const p of paths) {
    if (fs.existsSync(p)) return p
  }
  return null
}

/** Detect all code editors installed on this machine. */
export function detectEditors(): DetectedEditor[] {
  const found: DetectedEditor[] = []

  for (const def of KNOWN_EDITORS) {
    const cliOwned = resolveCliOwner(def.cli, def.cliIdentifier)
    const appPath = findApp(def.appPaths)

    if (cliOwned) {
      // CLI exists and is verified to belong to this editor
      found.push({ id: def.id, name: def.name, command: def.cli })
    } else if (appPath) {
      // No CLI (or CLI belongs to another editor) — use `open -a` on macOS
      found.push({ id: def.id, name: def.name, command: `open -a "${appPath}" --args` })
    }
  }

  return found
}

/** Open a file path in a specific editor by its command. */
export function openInEditor(command: string, filePath: string): void {
  exec(`${command} "${filePath}"`)
}
