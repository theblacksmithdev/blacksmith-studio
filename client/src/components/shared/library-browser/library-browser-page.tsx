import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, SimpleGrid } from "@chakra-ui/react";
import { LibraryHeader } from "./library-header";
import { LibraryCategoryTabs } from "./library-category-tabs";
import { LibraryPresetCard } from "./library-preset-card";
import { LibraryEmptySearch } from "./library-empty-search";
import type { LucideIcon } from "lucide-react";

export interface PresetItem {
  name: string;
  label: string;
  description: string;
  category: string;
  icon: LucideIcon;
  envHint?: string;
}

export interface CategoryItem {
  id: string;
  label: string;
}

export interface LibraryBrowserPageProps {
  icon: ReactNode;
  title: string;
  customLabel: string;
  presets: PresetItem[];
  categories: CategoryItem[];
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  filtered: PresetItem[];
  installedNames: Set<string>;
  installedCount: number;
  formatName?: (name: string) => string;
  onSelectPreset: (preset: PresetItem) => void;
  onAddCustom: () => void;
  editor?: ReactNode;
}

export function LibraryBrowserPage({
  icon,
  title,
  customLabel,
  presets,
  categories,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  filtered,
  installedNames,
  installedCount,
  formatName,
  onSelectPreset,
  onAddCustom,
  editor,
}: LibraryBrowserPageProps) {
  const navigate = useNavigate();

  return (
    <Flex
      direction="column"
      css={{ height: "100%", background: "var(--studio-bg-main)" }}
    >
      <LibraryHeader
        icon={icon}
        title={title}
        installedCount={installedCount}
        search={search}
        onSearchChange={onSearchChange}
        resultCount={filtered.length}
        totalCount={presets.length}
        customLabel={customLabel}
        onBack={() => navigate(-1)}
        onAddCustom={onAddCustom}
      />
      <LibraryCategoryTabs
        categories={categories}
        getCategoryCount={(id) =>
          id === "all"
            ? presets.length
            : presets.filter((p) => p.category === id).length
        }
        active={category}
        onChange={onCategoryChange}
      />
      <Flex
        direction="column"
        css={{ flex: 1, overflowY: "auto", padding: "18px 24px 32px" }}
      >
        {filtered.length === 0 ? (
          <LibraryEmptySearch
            customLabel={customLabel}
            onAddCustom={onAddCustom}
          />
        ) : (
          <SimpleGrid
            columns={3}
            gap="12px"
            css={{
              maxWidth: "960px",
              margin: "0 auto",
              width: "100%",
              minChildWidth: "260px",
            }}
          >
            {filtered.map((preset) => (
              <LibraryPresetCard
                key={preset.name}
                icon={preset.icon}
                label={preset.label}
                name={formatName ? formatName(preset.name) : preset.name}
                description={preset.description}
                category={preset.category}
                installed={installedNames.has(preset.name)}
                hint={preset.envHint}
                onClick={() => onSelectPreset(preset)}
              />
            ))}
          </SimpleGrid>
        )}
      </Flex>

      {editor}
    </Flex>
  );
}
