import { Flex, Box } from "@chakra-ui/react";
import { Text, Badge, spacing, radii } from "@/components/shared/ui";
import type { RunnerConfigData } from "@/api/types";

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <Flex direction="column" gap={spacing.xs}>
      <Text
        variant="tiny"
        color="muted"
        css={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        {label}
      </Text>
      <Text
        variant="bodySmall"
        css={
          mono ? { fontFamily: "'SF Mono', monospace", fontSize: "12px" } : {}
        }
      >
        {value}
      </Text>
    </Flex>
  );
}

interface ConfigDetailProps {
  config: RunnerConfigData;
}

export function ConfigDetail({ config }: ConfigDetailProps) {
  const envEntries = Object.entries(config.env || {});

  return (
    <Flex direction="column" gap={spacing.xl}>
      <Field label="Name" value={config.name} />
      <Field label="Command" value={config.command} mono />
      <Field label="Setup command" value={config.setupCommand} mono />
      <Field
        label="Working directory"
        value={config.cwd !== "." ? config.cwd : undefined}
        mono
      />
      <Field
        label="Default port"
        value={config.port ? String(config.port) : undefined}
      />
      <Field label="Ready pattern" value={config.readyPattern} mono />
      <Field label="Preview URL" value={config.previewUrl} mono />

      {envEntries.length > 0 && (
        <Flex direction="column" gap={spacing.sm}>
          <Text
            variant="tiny"
            color="muted"
            css={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Environment ({envEntries.length})
          </Text>
          <Flex
            direction="column"
            gap={spacing.xs}
            css={{
              padding: spacing.sm,
              borderRadius: radii.md,
              background: "var(--studio-bg-surface)",
              border: "1px solid var(--studio-border)",
            }}
          >
            {envEntries.map(([key, value]) => (
              <Flex key={key} align="center" gap={spacing.xs}>
                <Text
                  variant="caption"
                  css={{
                    fontFamily: "'SF Mono', monospace",
                    fontWeight: 500,
                    color: "var(--studio-text-primary)",
                  }}
                >
                  {key}
                </Text>
                <Text variant="caption" color="muted">
                  =
                </Text>
                <Text
                  variant="caption"
                  css={{
                    fontFamily: "'SF Mono', monospace",
                    color: "var(--studio-text-secondary)",
                  }}
                >
                  {value}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      )}

      {config.autoDetected && (
        <Badge variant="default" size="sm" css={{ alignSelf: "flex-start" }}>
          Auto-detected
        </Badge>
      )}
    </Flex>
  );
}
