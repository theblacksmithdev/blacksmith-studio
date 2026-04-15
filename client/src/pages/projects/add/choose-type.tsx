import { Box, Text, VStack, Flex } from "@chakra-ui/react";
import {
  FolderOpen,
  Plus,
  ArrowRight,
  GitBranch,
  Globe,
  HardDrive,
} from "lucide-react";

interface ChooseTypeProps {
  onExisting: () => void;
  onNew: () => void;
  onClone: () => void;
}

export function ChooseType({ onExisting, onNew, onClone }: ChooseTypeProps) {
  return (
    <VStack
      gap={8}
      css={{ maxWidth: "520px", width: "100%", padding: "0 24px" }}
    >
      <VStack gap={2}>
        <Text
          css={{
            fontSize: "24px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--studio-text-primary)",
            textAlign: "center",
          }}
        >
          Add a project
        </Text>
        <Text
          css={{
            fontSize: "15px",
            color: "var(--studio-text-tertiary)",
            textAlign: "center",
          }}
        >
          Open a local project, clone from a remote, or start fresh.
        </Text>
      </VStack>

      <VStack gap={5} align="stretch" css={{ width: "100%" }}>
        {/* ── Local ── */}
        <Box>
          <GroupLabel
            icon={<HardDrive size={11} />}
            label="From your machine"
          />
          <OptionCard
            icon={<FolderOpen size={20} />}
            title="Open existing project"
            description="Select a project folder already on your machine."
            onClick={onExisting}
          />
        </Box>

        {/* ── Remote ── */}
        <Box>
          <GroupLabel icon={<Globe size={11} />} label="From the internet" />
          <OptionCard
            icon={<GitBranch size={20} />}
            title="Clone a Git repository"
            description="Clone from GitHub, GitLab, Bitbucket, or any Git URL."
            onClick={onClone}
          />
        </Box>

        {/* ── Separator ── */}
        <Flex align="center" gap={3} css={{ padding: "0 4px" }}>
          <Box
            css={{ flex: 1, height: "1px", background: "var(--studio-border)" }}
          />
          <Text
            css={{
              fontSize: "12px",
              color: "var(--studio-text-muted)",
              flexShrink: 0,
            }}
          >
            or
          </Text>
          <Box
            css={{ flex: 1, height: "1px", background: "var(--studio-border)" }}
          />
        </Flex>

        {/* ── New ── */}
        <OptionCard
          icon={<Plus size={20} />}
          title="Create new project"
          description="Scaffold a new Blacksmith project with Django + React."
          onClick={onNew}
        />
      </VStack>
    </VStack>
  );
}

function GroupLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Flex
      align="center"
      gap={2}
      css={{ paddingLeft: "4px", marginBottom: "8px" }}
    >
      <Box css={{ color: "var(--studio-text-muted)", display: "flex" }}>
        {icon}
      </Box>
      <Text
        css={{
          fontSize: "12px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--studio-text-muted)",
        }}
      >
        {label}
      </Text>
    </Flex>
  );
}

function OptionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      css={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "18px 20px",
        borderRadius: "12px",
        border: "1px solid var(--studio-border)",
        background: "var(--studio-bg-sidebar)",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "var(--studio-border-hover)",
          background: "var(--studio-bg-hover)",
          "& .option-arrow": { opacity: 1, transform: "translateX(0)" },
        },
      }}
    >
      <Box
        css={{
          width: "44px",
          height: "44px",
          borderRadius: "11px",
          background: "var(--studio-bg-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--studio-text-tertiary)",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box css={{ flex: 1 }}>
        <Text
          css={{
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--studio-text-primary)",
            marginBottom: "2px",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </Text>
        <Text
          css={{
            fontSize: "13px",
            color: "var(--studio-text-muted)",
            lineHeight: 1.4,
          }}
        >
          {description}
        </Text>
      </Box>
      <Box
        className="option-arrow"
        css={{
          opacity: 0,
          transform: "translateX(-4px)",
          transition: "all 0.15s ease",
          color: "var(--studio-text-muted)",
          flexShrink: 0,
        }}
      >
        <ArrowRight size={16} />
      </Box>
    </Box>
  );
}
