import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Network, ArrowRight, Sparkles } from "lucide-react";
import { Text, ConfirmDialog } from "@/components/shared/ui";
import { PrimaryBtn } from "./styles";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 44px 24px;
  text-align: center;
  border-radius: 10px;
  border: 1px dashed var(--studio-border);
  background: var(--studio-bg-inset);
`;

const IconWrap = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--studio-text-muted);
`;

const Stat = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  font-size: 11px;
  font-weight: 500;
  color: var(--studio-text-muted);
  svg {
    color: var(--studio-green);
  }
`;

interface GraphifyEmptyStateProps {
  showConfirm: boolean;
  onRequestSetup: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GraphifyEmptyState({
  showConfirm,
  onRequestSetup,
  onConfirm,
  onCancel,
}: GraphifyEmptyStateProps) {
  return (
    <>
      <Wrap>
        <IconWrap>
          <Network size={24} />
        </IconWrap>
        <Flex direction="column" gap="6px" align="center">
          <Text
            css={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--studio-text-primary)",
            }}
          >
            Knowledge Graph
          </Text>
          <Text
            css={{
              fontSize: "13px",
              color: "var(--studio-text-tertiary)",
              maxWidth: "340px",
              lineHeight: 1.6,
            }}
          >
            Map your codebase into a knowledge graph so AI agents understand the
            full structure — classes, functions, imports, and relationships — at
            a fraction of the token cost.
          </Text>
        </Flex>
        <Flex gap="6px" flexWrap="wrap" justify="center">
          <Stat>
            <Sparkles size={10} />
            71x fewer tokens
          </Stat>
          <Stat>
            <Sparkles size={10} />
            25 languages
          </Stat>
          <Stat>
            <Sparkles size={10} />
            Auto-rebuild
          </Stat>
        </Flex>
        <PrimaryBtn onClick={onRequestSetup}>
          Set Up Graphify
          <ArrowRight size={13} />
        </PrimaryBtn>
      </Wrap>

      {showConfirm && (
        <ConfirmDialog
          message="Install Graphify?"
          description="This will install Graphify via pip and configure it for Blacksmith Studio. Requires Python 3.10+ on your system."
          confirmLabel="Install"
          cancelLabel="Cancel"
          variant="default"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
    </>
  );
}
