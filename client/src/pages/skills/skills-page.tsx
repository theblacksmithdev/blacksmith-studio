import { Wand2 } from "lucide-react";
import { LibraryBrowserPage } from "@/components/shared/library-browser";
import {
  SkillEditorModal,
  SKILL_PRESETS,
  SKILL_CATEGORIES,
} from "./components";
import { useSkillsBrowser } from "./hooks/use-skills-browser";

export function SkillsBrowserPage() {
  const {
    editor,
    search,
    category,
    filtered,
    installedNames,
    installedCount,
    setSearch,
    setCategory,
    setEditor,
    handleAdd,
  } = useSkillsBrowser();

  const editorSkill = editor?.preset
    ? {
        name: editor.preset.name,
        description: editor.preset.description,
        content: editor.preset.content,
      }
    : undefined;

  return (
    <LibraryBrowserPage
      icon={<Wand2 size={16} style={{ color: "var(--studio-text-muted)" }} />}
      title="Skills Library"
      customLabel="Create Skill"
      presets={SKILL_PRESETS}
      categories={SKILL_CATEGORIES}
      search={search}
      onSearchChange={setSearch}
      category={category}
      onCategoryChange={setCategory}
      filtered={filtered}
      installedNames={installedNames}
      installedCount={installedCount}
      formatName={(name) => `/${name}`}
      onSelectPreset={(preset) => setEditor({ preset: preset as any })}
      onAddCustom={() => setEditor({ custom: true })}
      editor={
        editor ? (
          <SkillEditorModal
            skill={editorSkill}
            onSave={handleAdd}
            onClose={() => setEditor(null)}
          />
        ) : undefined
      }
    />
  );
}
