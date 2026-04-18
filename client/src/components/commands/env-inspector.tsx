import { useEffect, useState } from "react";
import { useToolchainsQuery } from "@/api/hooks/commands";
import { EnvScopeCard } from "./env-scope-card";
import {
  FilterChip,
  FilterRow,
  InspectorHint,
  InspectorRoot,
  ToolchainChipRow,
} from "./styles";

/**
 * "Which python? which node?" inspector.
 *
 * Pick a toolchain via the chip row; both scopes — Project and Studio
 * — render side-by-side as `EnvScopeCard`s so the user can compare
 * where a given runtime would resolve to in each.
 */
export function EnvInspector() {
  const { data: toolchains = [] } = useToolchainsQuery();
  const [toolchainId, setToolchainId] = useState<string>("");

  useEffect(() => {
    if (!toolchainId && toolchains.length > 0) {
      setToolchainId(toolchains[0]!.id);
    }
  }, [toolchainId, toolchains]);

  if (toolchains.length === 0) {
    return (
      <InspectorRoot>
        <InspectorHint>No toolchains registered yet.</InspectorHint>
      </InspectorRoot>
    );
  }

  const activeId = toolchainId || toolchains[0]!.id;

  return (
    <InspectorRoot>
      <InspectorHint>
        See how this toolchain resolves in each scope before running a
        command.
      </InspectorHint>

      <ToolchainChipRow>
        <FilterRow>
          {toolchains.map((tc) => (
            <FilterChip
              key={tc.id}
              $active={activeId === tc.id}
              onClick={() => setToolchainId(tc.id)}
            >
              {tc.displayName}
            </FilterChip>
          ))}
        </FilterRow>
      </ToolchainChipRow>

      <EnvScopeCard toolchainId={activeId} scope="project" />
      <EnvScopeCard toolchainId={activeId} scope="studio" />
    </InspectorRoot>
  );
}
