import { useState } from "react";
import { Flex } from "@chakra-ui/react";
import { Cpu } from "lucide-react";
import {
  useCommandAvailabilityQuery,
  useResolvedEnvQuery,
  useToolchainsQuery,
} from "@/api/hooks/commands";
import type { CommandScope } from "@/api/types";
import {
  FieldLabel,
  FieldRow,
  FieldValue,
  InspectorCard,
  Select,
  StatusBadge,
} from "./styles";

/**
 * "Which python? which node?" inspector.
 *
 * Pick a toolchain + scope → see the resolved env display, bin path,
 * detected version, and whether it's actually runnable right now.
 * Purely read-only; nothing is mutated.
 */
export function EnvInspector() {
  const { data: toolchains = [] } = useToolchainsQuery();
  const [toolchainId, setToolchainId] = useState<string>("");
  const [scope, setScope] = useState<CommandScope>("project");

  const effectiveToolchain =
    toolchainId || toolchains[0]?.id || "";

  const { data: env } = useResolvedEnvQuery(effectiveToolchain, scope);
  const { data: availability } = useCommandAvailabilityQuery(
    effectiveToolchain,
    scope,
  );

  return (
    <InspectorCard>
      <Flex align="center" gap="8px">
        <Cpu size={14} style={{ color: "var(--studio-text-muted)" }} />
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--studio-text-primary)",
          }}
        >
          Environment inspector
        </span>
      </Flex>

      <Flex gap="8px" wrap="wrap">
        <Select
          value={effectiveToolchain}
          onChange={(e) => setToolchainId(e.target.value)}
          aria-label="Toolchain"
        >
          {toolchains.map((tc) => (
            <option key={tc.id} value={tc.id}>
              {tc.displayName}
            </option>
          ))}
        </Select>
        <Select
          value={scope}
          onChange={(e) => setScope(e.target.value as CommandScope)}
          aria-label="Scope"
        >
          <option value="project">project</option>
          <option value="studio">studio</option>
        </Select>
      </Flex>

      {env ? (
        <>
          <FieldRow>
            <FieldLabel>resolved</FieldLabel>
            <FieldValue>{env.displayName}</FieldValue>
          </FieldRow>
          <FieldRow>
            <FieldLabel>bin</FieldLabel>
            <FieldValue>{env.bin || "—"}</FieldValue>
          </FieldRow>
          {env.invoker && (
            <FieldRow>
              <FieldLabel>invoker</FieldLabel>
              <FieldValue>
                {env.invoker.command}
                {env.invoker.args.length > 0
                  ? ` ${env.invoker.args.join(" ")}`
                  : ""}
              </FieldValue>
            </FieldRow>
          )}
        </>
      ) : (
        <FieldRow>
          <FieldLabel>resolved</FieldLabel>
          <FieldValue>No environment detected</FieldValue>
        </FieldRow>
      )}

      {availability && (
        <FieldRow>
          <FieldLabel>status</FieldLabel>
          <StatusBadge $status={availability.ok ? "done" : "error"}>
            {availability.ok ? "available" : "unavailable"}
          </StatusBadge>
          {availability.version && (
            <FieldValue>{availability.version}</FieldValue>
          )}
          {availability.error && (
            <FieldValue>· {availability.error}</FieldValue>
          )}
        </FieldRow>
      )}
    </InspectorCard>
  );
}
