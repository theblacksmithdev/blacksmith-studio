import { Blocks } from "lucide-react";
import { LibraryBrowserPage } from "@/components/shared/library-browser";
import { PRESETS, CATEGORIES } from "./components/presets";
import { McpServerModal } from "./components/mcp-server-modal";
import { useMcpBrowser } from "./hooks/use-mcp-browser";

export default function McpBrowserPage() {
  const {
    search,
    setSearch,
    category,
    setCategory,
    filtered,
    installedNames,
    installedCount,
    editor,
    setEditor,
    editorServer,
    handleAdd,
  } = useMcpBrowser();

  return (
    <LibraryBrowserPage
      icon={<Blocks size={16} style={{ color: "var(--studio-text-muted)" }} />}
      title="MCP Servers"
      customLabel="Custom Server"
      presets={PRESETS}
      categories={CATEGORIES}
      search={search}
      onSearchChange={setSearch}
      category={category}
      onCategoryChange={setCategory}
      filtered={filtered}
      installedNames={installedNames}
      installedCount={installedCount}
      onSelectPreset={(preset) => setEditor({ preset: preset as any })}
      onAddCustom={() => setEditor({ custom: true })}
      editor={
        editor ? (
          <McpServerModal
            server={editorServer}
            onSave={handleAdd}
            onClose={() => setEditor(null)}
          />
        ) : undefined
      }
    />
  );
}
