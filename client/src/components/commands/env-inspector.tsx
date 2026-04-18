import { useEffect, useState } from "react";
import { useToolchainsQuery } from "@/api/hooks/commands";
import { EnvHero } from "./env-hero";
import {
  FilterChip,
  FilterRow,
  InspectorHint,
  InspectorRoot,
  ToolchainChipRow,
} from "./styles";

/**
 * Environment inspector — single hero per toolchain.
 *
 * The toolchain switcher only appears when more than one toolchain is
 * registered (most projects have one). Everything else — interpreter,
 * venv state, actions, studio scope — lives in `EnvHero`, which shows
 * the full picture in a single card.
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
  const activeToolchain = toolchains.find((tc) => tc.id === activeId)!;

  return (
    <InspectorRoot>
      {toolchains.length > 1 && (
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
      )}

      <EnvHero
        key={activeId}
        toolchainId={activeId}
        displayName={activeToolchain.displayName}
        primaryBinary={activeToolchain.binaries[0] ?? activeId}
        canCreate={!!activeToolchain.supportsProjectEnvCreation}
        canDelete={!!activeToolchain.supportsProjectEnvDeletion}
        canList={!!activeToolchain.supportsListInstalledVersions}
      />
    </InspectorRoot>
  );
}
