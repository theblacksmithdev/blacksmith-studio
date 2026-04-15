import { useState } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { GitBranch, GitMerge, Plus, Check } from "lucide-react";
import styled from "@emotion/styled";
import {
  Modal,
  ModalFooterSpacer,
  ModalPrimaryButton,
  ModalSecondaryButton,
  Text,
  Input,
  Alert,
  ConfirmDialog,
  spacing,
  radii,
} from "@/components/shared/ui";
import { useBranchActions } from "../../hooks";

const BranchRow = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  width: 100%;
  padding: 8px ${spacing.md};
  border-radius: ${radii.md};
  border: none;
  background: ${({ active }) =>
    active ? "var(--studio-bg-hover)" : "transparent"};
  cursor: ${({ active }) => (active ? "default" : "pointer")};
  font-family: inherit;
  text-align: left;
  transition: background 0.1s ease;
  &:hover {
    background: var(--studio-bg-hover);
  }
  &:hover .merge-action {
    opacity: 1;
  }
`;

const BranchDot = styled.div<{ active?: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ active }) =>
    active ? "var(--studio-accent)" : "transparent"};
  border: ${({ active }) =>
    active ? "none" : "1.5px solid var(--studio-border-hover)"};
`;

const MergeBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: ${radii.sm};
  border: 1px solid var(--studio-border);
  background: transparent;
  color: var(--studio-text-muted);
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
  opacity: 0;
  transition: all 0.1s ease;
  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`;

interface Props {
  onClose: () => void;
}

export function BranchSwitcher({ onClose }: Props) {
  const { branches, actions, pending, error, clearError } =
    useBranchActions(onClose);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [mergeSource, setMergeSource] = useState<string | null>(null);

  const filtered = branches.others.filter(
    (b) => !search || b.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    actions.create(trimmed);
    setNewName("");
    setShowCreate(false);
  };

  return (
    <>
      <Modal
        title="Branches"
        onClose={onClose}
        width="400px"
        headerExtra={
          <GitBranch size={15} style={{ color: "var(--studio-text-muted)" }} />
        }
        footer={
          showCreate ? (
            <>
              <ModalFooterSpacer />
              <ModalSecondaryButton
                onClick={() => {
                  setShowCreate(false);
                  setNewName("");
                }}
              >
                Cancel
              </ModalSecondaryButton>
              <ModalPrimaryButton
                onClick={handleCreate}
                disabled={!newName.trim() || pending.creating}
              >
                {pending.creating ? "Creating…" : "Create branch"}
              </ModalPrimaryButton>
            </>
          ) : (
            <>
              <ModalFooterSpacer />
              <ModalSecondaryButton onClick={() => setShowCreate(true)}>
                <Plus size={13} /> New branch
              </ModalSecondaryButton>
            </>
          )
        }
      >
        {error && (
          <Box css={{ marginBottom: spacing.md }}>
            <Alert variant="error" onDismiss={clearError}>
              {error}
            </Alert>
          </Box>
        )}

        {branches.others.length > 4 && (
          <Box css={{ marginBottom: spacing.md }}>
            <Input
              size="sm"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              placeholder="Filter branches…"
            />
          </Box>
        )}

        {showCreate && (
          <Box css={{ marginBottom: spacing.md }}>
            <Input
              size="sm"
              value={newName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewName(e.target.value)
              }
              placeholder="new-branch-name"
              autoFocus
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setShowCreate(false);
                  setNewName("");
                }
              }}
            />
          </Box>
        )}

        {branches.isLoading ? (
          <Flex
            align="center"
            justify="center"
            css={{ padding: spacing["3xl"] }}
          >
            <Text variant="caption" color="muted">
              Loading…
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" gap="2px">
            {/* Current branch */}
            {branches.current && (
              <BranchRow active>
                <BranchDot active />
                <Text
                  variant="bodySmall"
                  css={{
                    flex: 1,
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    fontWeight: 500,
                    color: "var(--studio-text-primary)",
                  }}
                >
                  {branches.current.name}
                </Text>
                <Check
                  size={13}
                  style={{ color: "var(--studio-text-muted)", flexShrink: 0 }}
                />
              </BranchRow>
            )}

            {/* Other branches */}
            {filtered.map((b) => (
              <BranchRow
                key={b.name}
                onClick={() => actions.checkout(b.name)}
                style={{
                  opacity: pending.switching ? 0.6 : 1,
                  cursor: pending.switching ? "wait" : "pointer",
                }}
              >
                <BranchDot />
                <Text
                  variant="bodySmall"
                  css={{
                    flex: 1,
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    color: "var(--studio-text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {b.name}
                </Text>
                <MergeBtn
                  className="merge-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMergeSource(b.name);
                  }}
                >
                  <GitMerge size={10} /> Merge
                </MergeBtn>
              </BranchRow>
            ))}

            {filtered.length === 0 && search && (
              <Flex
                align="center"
                justify="center"
                css={{ padding: spacing.xl }}
              >
                <Text variant="caption" color="muted">
                  No branches match "{search}"
                </Text>
              </Flex>
            )}
          </Flex>
        )}
      </Modal>

      {mergeSource && branches.current && (
        <ConfirmDialog
          message={`Merge "${mergeSource}" into "${branches.current.name}"?`}
          description="This will merge the selected branch into your current branch. Resolve any conflicts if they arise."
          confirmLabel={pending.merging ? "Merging…" : "Merge"}
          variant="default"
          onConfirm={() => {
            actions.mergeInto(mergeSource);
            setMergeSource(null);
          }}
          onCancel={() => setMergeSource(null)}
          loading={pending.merging}
        />
      )}
    </>
  );
}
