import { Flex } from "@chakra-ui/react";
import { FileWarning, RotateCw } from "lucide-react";
import { Text, spacing } from "@/components/shared/ui";
import { useFiles } from "@/hooks/use-files";

function getFriendlyError(error: string): {
  title: string;
  description: string;
} {
  const lower = error.toLowerCase();

  if (lower.includes("too large"))
    return {
      title: "This file is too large to preview",
      description:
        "Files over 512 KB can't be displayed here. Try opening it in an external editor.",
    };

  if (lower.includes("access denied") || lower.includes("outside project"))
    return {
      title: "This file can't be accessed",
      description:
        "The file is outside the project directory and can't be opened for security reasons.",
    };

  if (lower.includes("enoent") || lower.includes("no such file"))
    return {
      title: "File not found",
      description: "This file may have been moved, renamed, or deleted.",
    };

  if (lower.includes("eisdir"))
    return {
      title: "This is a folder",
      description:
        "Folders can't be previewed. Select a file from the explorer to view its contents.",
    };

  if (lower.includes("eacces") || lower.includes("permission"))
    return {
      title: "Permission denied",
      description:
        "You don't have permission to read this file. Check the file permissions and try again.",
    };

  return {
    title: "Something went wrong",
    description:
      "We couldn't load this file. It may be corrupted, binary, or temporarily unavailable.",
  };
}

interface ErrorStateProps {
  error: string;
  filePath: string;
}

export function ErrorState({ error, filePath }: ErrorStateProps) {
  const { fetchFileContent } = useFiles();
  const { title, description } = getFriendlyError(error);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={spacing.lg}
      css={{ flex: 1 }}
    >
      <Flex
        align="center"
        justify="center"
        css={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "var(--studio-error-subtle)",
        }}
      >
        <FileWarning size={22} color="var(--studio-text-muted)" />
      </Flex>

      <Flex direction="column" align="center" gap={spacing.xs}>
        <Text variant="subtitle" color="primary">
          {title}
        </Text>
        <Text
          variant="bodySmall"
          color="muted"
          css={{ maxWidth: "320px", textAlign: "center" }}
        >
          {description}
        </Text>
      </Flex>

      <Flex
        as="button"
        align="center"
        gap={spacing.xs}
        onClick={() => fetchFileContent(filePath)}
        css={{
          padding: `${spacing.xs} ${spacing.md}`,
          borderRadius: "8px",
          border: "1px solid var(--studio-border)",
          background: "var(--studio-bg-surface)",
          color: "var(--studio-text-secondary)",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.15s ease",
          "&:hover": {
            background: "var(--studio-bg-hover)",
            color: "var(--studio-text-primary)",
          },
        }}
      >
        <RotateCw size={13} />
        <Text variant="bodySmall" css={{ color: "inherit" }}>
          Try again
        </Text>
      </Flex>
    </Flex>
  );
}
