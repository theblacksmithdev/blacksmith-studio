import { getDatabase } from "../../../db/index.js";
import { SessionManager } from "../../chat/single-agent/index.js";
import { AgentSessionManager } from "../../chat/multi-agents/index.js";
import {
  ArtifactRepository,
  ArtifactService,
} from "../../artifacts/index.js";
import { ProjectManager } from "../../projects.js";
import { SettingsManager } from "../../settings.js";
import {
  ConversationEventService,
  EventRepository,
} from "../../events/index.js";
import {
  BinaryDetector,
  CommandEnvBuilder,
  CommandEventEmitter,
  CommandResolver,
  CommandRunRepository,
  CommandRunner,
  CommandService,
  DefaultCommandPolicy,
  EnvScrubber,
  NodeToolchain,
  NodeVersionDetector,
  PlatformInfo,
  PythonToolchain,
  PythonVenvDetector,
  RawToolchain,
  ToolchainRegistry,
  settingsKeyForToolchain,
} from "../../commands/index.js";
import { UvBinaryResolver } from "../../python/uv-binary.js";
import { ContextMcpServer } from "./context-mcp-server.js";
import { ContextQueryService } from "./context-query-service.js";
import { ContextWriteService } from "./context-write-service.js";
import { attachStdioTransport } from "./stdio-transport.js";

/**
 * Stdio entry point: wires the DB → repos/services → MCP server and
 * begins listening on stdio. Spawned by Claude CLI (via `.mcp.json`)
 * whenever an agent process starts, terminated on stdin EOF.
 *
 * Each spawn opens its own SQLite connection through `getDatabase()`.
 * WAL mode (enabled in connection.ts) permits concurrent reads/writes
 * with the main Electron process, which holds the primary handle.
 */
function main() {
  const db = getDatabase();
  const sessionManager = new SessionManager(db);
  const agentSessionManager = new AgentSessionManager(db);
  const projectManager = new ProjectManager();
  const settingsManager = new SettingsManager();
  const eventService = new ConversationEventService(new EventRepository(db));
  const artifactService = new ArtifactService(new ArtifactRepository(db), {
    getPath: (projectId: string) => {
      const project = projectManager.get(projectId);
      if (!project) throw new Error(`Project not found: ${projectId}`);
      return project.path;
    },
  });

  // ── Command subsystem (same composition as main process) ──
  const platformInfo = new PlatformInfo();
  const binaryDetector = new BinaryDetector(platformInfo);
  const uvResolver = new UvBinaryResolver(platformInfo);
  const toolchainRegistry = new ToolchainRegistry();
  toolchainRegistry.register(
    new PythonToolchain(
      new PythonVenvDetector(platformInfo),
      binaryDetector,
      platformInfo,
      uvResolver,
    ),
  );
  toolchainRegistry.register(
    new NodeToolchain(new NodeVersionDetector(), binaryDetector, platformInfo),
  );
  toolchainRegistry.register(new RawToolchain());
  const envScrubber = new EnvScrubber();
  const commandResolver = new CommandResolver(
    toolchainRegistry,
    new CommandEnvBuilder(envScrubber),
    {
      getPath: (projectId: string) => {
        const project = projectManager.get(projectId);
        if (!project) throw new Error(`Project not found: ${projectId}`);
        return project.path;
      },
    },
    {
      getExplicitPath: (projectId: string, toolchainId: string) => {
        const value = settingsManager.resolve(
          projectId,
          settingsKeyForToolchain(toolchainId),
        );
        return typeof value === "string" && value.length > 0 ? value : null;
      },
    },
  );
  const commandService = new CommandService(
    toolchainRegistry,
    commandResolver,
    new CommandRunner(),
    new CommandRunRepository(db),
    new CommandEventEmitter(eventService),
    new DefaultCommandPolicy(),
  );

  const queryService = new ContextQueryService(
    db,
    sessionManager,
    agentSessionManager,
  );
  const writeService = new ContextWriteService(agentSessionManager);

  const server = new ContextMcpServer(
    queryService,
    writeService,
    artifactService,
    commandService,
  );
  attachStdioTransport(server);

  process.stderr.write(
    "[context-mcp] ready; listening on stdio\n",
  );
}

main();
