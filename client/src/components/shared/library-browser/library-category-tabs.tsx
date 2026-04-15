import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";

const Tab = styled.button<{ active: boolean }>`
  padding: 5px 14px;
  border-radius: 20px;
  border: none;
  font-size: 13px;
  font-weight: ${(p) => (p.active ? 500 : 400)};
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  background: ${(p) => (p.active ? "var(--studio-accent)" : "transparent")};
  color: ${(p) =>
    p.active ? "var(--studio-accent-fg)" : "var(--studio-text-muted)"};
  white-space: nowrap;

  &:hover {
    ${(p) =>
      !p.active &&
      "color: var(--studio-text-secondary); background: var(--studio-bg-surface);"}
  }
`;

const Count = styled.span`
  font-size: 11px;
  margin-left: 4px;
  opacity: 0.6;
`;

export interface LibraryCategory {
  id: string;
  label: string;
}

interface LibraryCategoryTabsProps {
  categories: LibraryCategory[];
  getCategoryCount: (categoryId: string) => number;
  active: string;
  onChange: (id: string) => void;
}

export function LibraryCategoryTabs({
  categories,
  getCategoryCount,
  active,
  onChange,
}: LibraryCategoryTabsProps) {
  return (
    <Flex justify="center" css={{ padding: "14px 24px" }}>
      <Flex gap="4px" css={{ flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <Tab
            key={cat.id}
            active={active === cat.id}
            onClick={() => onChange(cat.id)}
          >
            {cat.label}
            <Count>{getCategoryCount(cat.id)}</Count>
          </Tab>
        ))}
      </Flex>
    </Flex>
  );
}
