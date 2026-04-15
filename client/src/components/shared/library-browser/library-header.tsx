import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { Text, IconButton, Badge } from "@/components/shared/ui";
import type { ReactNode } from "react";

const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  transition: border-color 0.12s ease;
  max-width: 480px;
  width: 100%;

  &:focus-within {
    border-color: var(--studio-border-hover);
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--studio-text-primary);
  font-family: inherit;
  flex: 1;
  min-width: 0;

  &::placeholder {
    color: var(--studio-text-muted);
  }
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`;

interface LibraryHeaderProps {
  icon: ReactNode;
  title: string;
  installedCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  resultCount: number;
  totalCount: number;
  customLabel: string;
  onBack: () => void;
  onAddCustom: () => void;
}

export function LibraryHeader({
  icon,
  title,
  installedCount,
  search,
  onSearchChange,
  resultCount,
  totalCount,
  customLabel,
  onBack,
  onAddCustom,
}: LibraryHeaderProps) {
  return (
    <Box css={{ flexShrink: 0, padding: "16px 24px 0" }}>
      <Flex
        align="center"
        justify="space-between"
        css={{ marginBottom: "20px" }}
      >
        <Flex align="center" gap="10px">
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onBack}
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </IconButton>
          <Flex align="center" gap="8px">
            {icon}
            <Text
              css={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--studio-text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </Text>
          </Flex>
          <Badge variant="default" size="sm">
            {installedCount} installed
          </Badge>
        </Flex>
        <AddBtn onClick={onAddCustom}>
          <Plus size={13} /> {customLabel}
        </AddBtn>
      </Flex>

      <Flex justify="center">
        <SearchWrap>
          <Search
            size={15}
            style={{ color: "var(--studio-text-muted)", flexShrink: 0 }}
          />
          <SearchInput
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
          />
          {search && (
            <Text
              css={{
                fontSize: "12px",
                color: "var(--studio-text-muted)",
                flexShrink: 0,
              }}
            >
              {resultCount}/{totalCount}
            </Text>
          )}
        </SearchWrap>
      </Flex>
    </Box>
  );
}
