import { Box, Flex, HStack, VStack } from "@chakra-ui/react";
import {
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Alert, Button, Text } from "@/components/shared/ui";
import { BinaryPicker } from "@/components/shared/wizard";
import { MIN_NODE_MAJOR } from "@/constants";
import { useNodePicker } from "../hooks";
import { emptyHintCss, selectedPillCss } from "./styles";

interface NodeStepProps {
  value: string | null;
  version: string | null;
  onPick: (path: string, version: string) => void;
}

/**
 * Node.js picker step. All detection + validation + auto-pick logic
 * lives in `useNodePicker` — this file is pure layout.
 */
export function NodeStep({ value, version, onPick }: NodeStepProps) {
  const { candidates, loading, selectedInvalid, detected, rescan } =
    useNodePicker({ value, version, onPick });

  const nothingFound = detected && candidates.length === 0;

  return (
    <>
      {nothingFound ? (
        <VStack align="stretch" gap="8px" css={emptyHintCss}>
          <Text variant="body">
            We couldn't find Node.js on your system. Install Node {MIN_NODE_MAJOR}
            {" "}or newer and come back to this step.
          </Text>
          <Box>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.open("https://nodejs.org")}
            >
              <ExternalLink size={13} /> Download Node.js
            </Button>
          </Box>
        </VStack>
      ) : (
        <BinaryPicker
          candidates={candidates}
          value={value}
          onChange={onPick}
          browseTitle="Select Node.js binary"
          disabled={loading}
          emptyHint="No Node.js installations detected."
        />
      )}

      {selectedInvalid && (
        <Alert variant="warning" icon={<AlertTriangle size={14} />}>
          Node {version} is below the minimum of v{MIN_NODE_MAJOR}. Pick a
          newer install or upgrade before continuing.
        </Alert>
      )}

      <HStack gap="8px" mt="4px">
        <Button variant="ghost" size="sm" onClick={rescan} disabled={loading}>
          <RefreshCw size={13} />
          Rescan
        </Button>
        {value && !selectedInvalid && (
          <Flex css={selectedPillCss}>
            <CheckCircle2 size={13} style={{ color: "var(--studio-accent)" }} />
            Selected
          </Flex>
        )}
      </HStack>
    </>
  );
}
