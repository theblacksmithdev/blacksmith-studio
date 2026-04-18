import { Flex } from "@chakra-ui/react";
import { Drawer } from "@/components/shared/drawer";
import { useCommandRunQuery } from "@/api/hooks/commands";
import {
  DrawerBody,
  FieldLabel,
  FieldRow,
  FieldValue,
  Preformatted,
  StatusBadge,
} from "./styles";

interface CommandRunDrawerProps {
  runId: string;
  onClose: () => void;
}

/**
 * Detailed view of a single run — full stdout/stderr, resolved env,
 * argv, timing. Content is DB-backed so reload reproduces exactly.
 */
export function CommandRunDrawer({ runId, onClose }: CommandRunDrawerProps) {
  const { data: run, isLoading } = useCommandRunQuery(runId);

  return (
    <Drawer title="Command run" onClose={onClose} size="620px">
      {isLoading || !run ? (
        <DrawerBody>Loading…</DrawerBody>
      ) : (
        <DrawerBody>
          <FieldRow>
            <FieldLabel>status</FieldLabel>
            <StatusBadge $status={run.status}>{run.status}</StatusBadge>
            {run.exitCode != null && (
              <FieldValue>· exit {run.exitCode}</FieldValue>
            )}
            {run.durationMs != null && (
              <FieldValue>· {run.durationMs}ms</FieldValue>
            )}
          </FieldRow>
          <FieldRow>
            <FieldLabel>toolchain</FieldLabel>
            <FieldValue>
              {run.toolchainId}
              {run.preset ? ` · ${run.preset}` : ""}
            </FieldValue>
          </FieldRow>
          <FieldRow>
            <FieldLabel>scope</FieldLabel>
            <FieldValue>{run.scope}</FieldValue>
          </FieldRow>
          {run.resolvedEnvDisplay && (
            <FieldRow>
              <FieldLabel>env</FieldLabel>
              <FieldValue>{run.resolvedEnvDisplay}</FieldValue>
            </FieldRow>
          )}
          <FieldRow>
            <FieldLabel>command</FieldLabel>
            <FieldValue>{run.command}</FieldValue>
          </FieldRow>
          <FieldRow>
            <FieldLabel>args</FieldLabel>
            <FieldValue>{run.args}</FieldValue>
          </FieldRow>
          <FieldRow>
            <FieldLabel>cwd</FieldLabel>
            <FieldValue>{run.cwd}</FieldValue>
          </FieldRow>
          <FieldRow>
            <FieldLabel>started</FieldLabel>
            <FieldValue>{run.startedAt}</FieldValue>
          </FieldRow>
          {run.finishedAt && (
            <FieldRow>
              <FieldLabel>finished</FieldLabel>
              <FieldValue>{run.finishedAt}</FieldValue>
            </FieldRow>
          )}
          {run.agentRole && (
            <FieldRow>
              <FieldLabel>agent</FieldLabel>
              <FieldValue>{run.agentRole}</FieldValue>
            </FieldRow>
          )}

          <Flex
            direction="column"
            gap="4px"
            css={{ marginTop: "10px" }}
          >
            <FieldLabel>stdout</FieldLabel>
            <Preformatted>{run.stdout ?? "(empty)"}</Preformatted>
          </Flex>
          {run.stderr && (
            <Flex direction="column" gap="4px">
              <FieldLabel>stderr</FieldLabel>
              <Preformatted>{run.stderr}</Preformatted>
            </Flex>
          )}
        </DrawerBody>
      )}
    </Drawer>
  );
}
