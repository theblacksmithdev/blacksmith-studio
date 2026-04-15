import { FolderOpen, Plus, GitBranch, HardDrive, Globe } from "lucide-react";
import { Text, VStack, HStack, Divider, spacing } from "@/components/shared/ui";
import { OptionCard } from "./option-card";

interface ChooseStepProps {
  onImport: () => void;
  onCreate: () => void;
  onClone: () => void;
}

export function ChooseStep({ onImport, onCreate, onClone }: ChooseStepProps) {
  return (
    <VStack gap="xl">
      <VStack gap="sm">
        <HStack gap="xs" css={{ paddingLeft: spacing.xs }}>
          <HardDrive size={11} style={{ color: "var(--studio-text-muted)" }} />
          <Text variant="tiny" color="muted">
            From your machine
          </Text>
        </HStack>
        <OptionCard
          icon={<FolderOpen size={18} />}
          title="Open existing project"
          description="Select a project folder on your machine."
          onClick={onImport}
        />
      </VStack>

      <VStack gap="sm">
        <HStack gap="xs" css={{ paddingLeft: spacing.xs }}>
          <Globe size={11} style={{ color: "var(--studio-text-muted)" }} />
          <Text variant="tiny" color="muted">
            From the internet
          </Text>
        </HStack>
        <OptionCard
          icon={<GitBranch size={18} />}
          title="Clone a Git repository"
          description="Clone from GitHub, GitLab, or any Git URL."
          onClick={onClone}
        />
      </VStack>

      <HStack gap="md" css={{ alignItems: "center" }}>
        <Divider variant="full" />
        <Text variant="caption" color="muted" css={{ flexShrink: 0 }}>
          or
        </Text>
        <Divider variant="full" />
      </HStack>

      <OptionCard
        icon={<Plus size={18} />}
        title="Create new project"
        description="Scaffold a new project with AI support."
        onClick={onCreate}
      />
    </VStack>
  );
}
