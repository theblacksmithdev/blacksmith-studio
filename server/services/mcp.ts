import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

/* ── Types ── */

export interface McpServerStdio {
  command: string
  args?: string[]
  env?: Record<string, string>
}

export interface McpServerHttp {
  url: string
  headers?: Record<string, string>
}

export type McpServerConfig = McpServerStdio | McpServerHttp

export type McpTransport = 'stdio' | 'http'

export interface McpServerEntry {
  name: string
  transport: McpTransport
  config: McpServerConfig
  enabled: boolean
  status: 'unknown' | 'connected' | 'error' | 'disconnected'
  error?: string
}

interface McpFileSchema {
  mcpServers: Record<string, McpServerConfig>
}

/* ── Default servers ── */

const DEFAULT_SERVERS: Record<string, McpServerConfig> = {
  'chakra-ui-docs': {
    command: 'npx',
    args: ['-y', 'mcp-docs-server', '--url', 'https://www.chakra-ui.com/docs', '--name', 'chakra-ui-docs'],
  },
  'react-docs': {
    command: 'npx',
    args: ['-y', 'mcp-docs-server', '--url', 'https://react.dev', '--name', 'react-docs'],
  },
  'django-docs': {
    command: 'npx',
    args: ['-y', 'mcp-docs-server', '--url', 'https://docs.djangoproject.com/en/5.1/', '--name', 'django-docs'],
  },
  filesystem: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '.'],
  },
  figma: {
    command: 'npx',
    args: ['-y', 'figma-developer-mcp', '--stdio'],
    env: { FIGMA_API_KEY: '' },
  },
}

/* ── Manager ── */

export class McpManager {
  private errors = new Map<string, string>()

  private configPath(projectRoot: string): string {
    return path.join(projectRoot, '.mcp.json')
  }

  private read(projectRoot: string): McpFileSchema {
    const filePath = this.configPath(projectRoot)
    if (!fs.existsSync(filePath)) {
      // Seed with default servers on first access
      const defaults: McpFileSchema = { mcpServers: { ...DEFAULT_SERVERS } }
      this.write(projectRoot, defaults)
      return defaults
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {
      return { mcpServers: {} }
    }
  }

  private write(projectRoot: string, data: McpFileSchema): void {
    const filePath = this.configPath(projectRoot)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  }

  private getTransport(config: McpServerConfig): McpTransport {
    return 'url' in config ? 'http' : 'stdio'
  }

  list(projectRoot: string, disabledServers: string[] = []): McpServerEntry[] {
    const data = this.read(projectRoot)
    const disabledSet = new Set(disabledServers)

    return Object.entries(data.mcpServers).map(([name, config]) => {
      const enabled = !disabledSet.has(name)
      const lastError = this.errors.get(name)

      return {
        name,
        transport: this.getTransport(config),
        config,
        enabled,
        status: !enabled ? 'disconnected' : lastError ? 'error' : 'unknown',
        error: lastError,
      }
    })
  }

  add(projectRoot: string, name: string, config: McpServerConfig): void {
    const data = this.read(projectRoot)
    if (data.mcpServers[name]) {
      throw new Error(`MCP server "${name}" already exists`)
    }
    data.mcpServers[name] = config
    this.write(projectRoot, data)
  }

  update(projectRoot: string, name: string, config: McpServerConfig): void {
    const data = this.read(projectRoot)
    if (!data.mcpServers[name]) {
      throw new Error(`MCP server "${name}" not found`)
    }
    data.mcpServers[name] = config
    this.errors.delete(name)
    this.write(projectRoot, data)
  }

  remove(projectRoot: string, name: string): void {
    const data = this.read(projectRoot)
    delete data.mcpServers[name]
    this.errors.delete(name)
    this.write(projectRoot, data)
  }

  async testConnection(projectRoot: string, name: string): Promise<{ ok: boolean; error?: string }> {
    const data = this.read(projectRoot)
    const config = data.mcpServers[name]
    if (!config) {
      return { ok: false, error: `Server "${name}" not found` }
    }

    if ('url' in config) {
      return this.testHttp(config as McpServerHttp, name)
    }
    return this.testStdio(config as McpServerStdio, name)
  }

  private async testHttp(config: McpServerHttp, name: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(config.url, {
        signal: controller.signal,
        headers: config.headers,
      })
      clearTimeout(timeout)

      if (res.ok || res.status === 405) {
        this.errors.delete(name)
        return { ok: true }
      }
      const err = `HTTP ${res.status}`
      this.errors.set(name, err)
      return { ok: false, error: err }
    } catch (e: any) {
      const err = e.name === 'AbortError' ? 'Connection timed out' : (e.message || 'Connection failed')
      this.errors.set(name, err)
      return { ok: false, error: err }
    }
  }

  private testStdio(config: McpServerStdio, name: string): Promise<{ ok: boolean; error?: string }> {
    return new Promise((resolve) => {
      try {
        const proc = spawn(config.command, config.args || [], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, ...config.env },
          timeout: 5000,
        })

        let resolved = false
        const done = (ok: boolean, error?: string) => {
          if (resolved) return
          resolved = true
          proc.kill()
          if (ok) {
            this.errors.delete(name)
          } else if (error) {
            this.errors.set(name, error)
          }
          resolve({ ok, error })
        }

        proc.on('spawn', () => done(true))
        proc.on('error', (err) => done(false, err.message))

        setTimeout(() => done(false, 'Process did not start within 5s'), 5000)
      } catch (e: any) {
        const err = e.message || 'Failed to spawn process'
        this.errors.set(name, err)
        resolve({ ok: false, error: err })
      }
    })
  }

  /**
   * Returns the path to an MCP config file with only enabled servers.
   * If all servers are enabled, returns the original .mcp.json path.
   * If no servers are enabled, returns undefined.
   */
  getEnabledConfigPath(projectRoot: string, disabledServers: string[] = []): string | undefined {
    const data = this.read(projectRoot)
    const serverNames = Object.keys(data.mcpServers)
    if (serverNames.length === 0) return undefined

    const disabledSet = new Set(disabledServers)
    const enabledServers: Record<string, McpServerConfig> = {}

    for (const [name, config] of Object.entries(data.mcpServers)) {
      if (!disabledSet.has(name)) {
        enabledServers[name] = config
      }
    }

    if (Object.keys(enabledServers).length === 0) return undefined

    // If nothing is disabled, return original file
    if (disabledSet.size === 0 || Object.keys(enabledServers).length === serverNames.length) {
      return this.configPath(projectRoot)
    }

    // Write filtered config to temp location
    const studioDir = path.join(projectRoot, '.blacksmith-studio')
    if (!fs.existsSync(studioDir)) {
      fs.mkdirSync(studioDir, { recursive: true })
    }
    const filteredPath = path.join(studioDir, 'mcp-active.json')
    fs.writeFileSync(filteredPath, JSON.stringify({ mcpServers: enabledServers }, null, 2) + '\n', 'utf-8')
    return filteredPath
  }
}
