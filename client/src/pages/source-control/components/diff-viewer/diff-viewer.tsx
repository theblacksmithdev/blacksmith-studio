import { Flex } from "@chakra-ui/react";
import { Text } from "@/components/shared/ui";
import { useParsedDiff } from "../../hooks";
import { DiffHeader, DiffTable, NoFileSelected, NoChanges } from "./components";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      direction="column"
      css={{
        height: "100%",
        background: "var(--studio-bg-main)",
        overflow: "hidden",
      }}
    >
      {children}
    </Flex>
  );
}

interface DiffViewerProps {
  filePath?: string;
  onClose?: () => void;
}

export function DiffViewer({ filePath, onClose }: DiffViewerProps) {
  const { parsed, isLoading } = useParsedDiff(filePath);

  if (!filePath) {
    return (
      <Shell>
        <NoFileSelected />
      </Shell>
    );
  }

  if (isLoading) {
    return (
      <Shell>
        <Flex align="center" justify="center" css={{ flex: 1 }}>
          <Text variant="caption" color="muted">
            Loading diff...
          </Text>
        </Flex>
      </Shell>
    );
  }

  if (!parsed || parsed.lines.length === 0) {
    return (
      <Shell>
        <NoChanges filePath={filePath} onClose={onClose} />
      </Shell>
    );
  }

  return (
    <Shell>
      <DiffHeader
        filePath={filePath}
        additions={parsed.additions}
        deletions={parsed.deletions}
        onClose={onClose}
      />
      <DiffTable parsed={parsed} />
    </Shell>
  );
}
