import { Flex } from "@chakra-ui/react";
import { FileCode2 } from "lucide-react";
import { Text } from "@/components/shared/ui";

export function EmptyViewer() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={3}
      css={{ flex: 1, height: "100%", color: "var(--studio-text-muted)" }}
    >
      <FileCode2 size={28} style={{ opacity: 0.3 }} />
      <Text variant="body" color="muted">
        Select a file to view
      </Text>
    </Flex>
  );
}
