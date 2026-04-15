import { useState, type ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Network, Eye, FileCode } from "lucide-react";
import { AgentTabBar, type AgentTab } from "./agent-tab-bar";
import { AgentArtifacts } from "./agent-artifacts";
import { RunnerPreview } from "@/components/runner/preview";

const TABS = [
  { id: "agents" as const, icon: <Network />, label: "Agents" },
  { id: "preview" as const, icon: <Eye />, label: "Preview" },
  { id: "artifacts" as const, icon: <FileCode />, label: "Artifacts" },
];

interface AgentMainPanelProps {
  canvas: ReactNode;
  conversationId?: string;
}

export function AgentMainPanel({
  canvas,
  conversationId,
}: AgentMainPanelProps) {
  const [activeTab, setActiveTab] = useState<AgentTab>("agents");

  return (
    <Flex direction="column" css={{ height: "100%", width: "100%" }}>
      <AgentTabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <Box
        css={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Agents canvas — always mounted to preserve ReactFlow state */}
        <Box
          css={{
            position: "absolute",
            inset: 0,
            display: activeTab === "agents" ? "flex" : "none",
            flexDirection: "column",
          }}
        >
          {canvas}
        </Box>

        {/* Preview */}
        {activeTab === "preview" && (
          <Flex css={{ height: "100%", width: "100%" }}>
            <RunnerPreview />
          </Flex>
        )}

        {/* Artifacts */}
        {activeTab === "artifacts" && (
          <Flex css={{ height: "100%", width: "100%" }}>
            <AgentArtifacts conversationId={conversationId} />
          </Flex>
        )}
      </Box>
    </Flex>
  );
}
