import { Flex } from "@chakra-ui/react";
import { GlobalInterpreterRow } from "./global-interpreter-row";
import { StudioVenvRow } from "./studio-venv-row";

/**
 * Global scope — user-level defaults every project falls back to,
 * plus the shared studio venv at `~/.blacksmith-studio/venv/`.
 */
export function GlobalScopeView() {
  return (
    <Flex direction="column" gap="28px">
      <GlobalInterpreterRow toolchainId="python" />
      <GlobalInterpreterRow toolchainId="node" />
      <StudioVenvRow />
    </Flex>
  );
}
