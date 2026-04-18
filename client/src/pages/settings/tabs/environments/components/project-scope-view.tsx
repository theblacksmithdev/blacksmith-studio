import { Flex } from "@chakra-ui/react";
import { ProjectInterpreterRow } from "./project-interpreter-row";

/**
 * Project scope — per-project interpreter pins + managed venv
 * lifecycle. Studio venv is omitted here because it's user-wide, not
 * project state.
 */
export function ProjectScopeView() {
  return (
    <Flex direction="column" gap="28px">
      <ProjectInterpreterRow toolchainId="python" />
      <ProjectInterpreterRow toolchainId="node" />
    </Flex>
  );
}
