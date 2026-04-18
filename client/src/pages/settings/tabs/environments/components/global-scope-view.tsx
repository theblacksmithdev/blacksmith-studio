import { Flex } from "@chakra-ui/react";
import { InterpreterRow } from "./interpreter-row";
import { StudioVenvRow } from "./studio-venv-row";

/**
 * Global scope — user-level defaults every project falls back to,
 * plus the shared studio venv at `~/.blacksmith-studio/venv/`.
 */
export function GlobalScopeView() {
  return (
    <Flex direction="column" gap="18px">
      <InterpreterRow toolchainId="python" scope="global" />
      <InterpreterRow toolchainId="node" scope="global" />
      <StudioVenvRow />
    </Flex>
  );
}
