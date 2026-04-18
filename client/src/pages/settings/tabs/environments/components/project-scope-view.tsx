import { Flex } from "@chakra-ui/react";
import { InterpreterRow } from "./interpreter-row";

/**
 * Project scope — per-project interpreter pins + managed venv
 * lifecycle. Studio venv is omitted here because it's user-wide, not
 * project state.
 */
export function ProjectScopeView() {
  return (
    <Flex direction="column" gap="28px">
      <InterpreterRow toolchainId="python" scope="project" />
      <InterpreterRow toolchainId="node" scope="project" />
    </Flex>
  );
}
