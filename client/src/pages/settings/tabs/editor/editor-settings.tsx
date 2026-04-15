import { Flex } from "@chakra-ui/react";
import { IndentIncrease, WrapText, Map, Hash } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { SettingToggle } from "@/pages/settings/components/setting-toggle";
import { SegmentedControl } from "@/pages/settings/components/segmented-control";
import {
  useEditorSettings,
  TAB_SIZE_OPTIONS,
} from "./hooks/use-editor-settings";

export function EditorSettings() {
  const editor = useEditorSettings();

  return (
    <SettingsSection
      title="Editor"
      description="Configure the built-in code viewer and editor."
    >
      <SettingRow
        label="Tab size"
        description={
          <Flex align="center" gap="4px">
            <IndentIncrease size={11} /> Spaces per indentation level.
          </Flex>
        }
      >
        <SegmentedControl
          value={String(editor.tabSize)}
          options={[...TAB_SIZE_OPTIONS]}
          onChange={editor.setTabSize}
        />
      </SettingRow>
      <SettingRow
        label="Word wrap"
        description={
          <Flex align="center" gap="4px">
            <WrapText size={11} /> Wrap long lines instead of horizontal
            scrolling.
          </Flex>
        }
      >
        <SettingToggle value={editor.wordWrap} onChange={editor.setWordWrap} />
      </SettingRow>
      <SettingRow
        label="Minimap"
        description={
          <Flex align="center" gap="4px">
            <Map size={11} /> Show a minimap overview for large files.
          </Flex>
        }
      >
        <SettingToggle value={editor.minimap} onChange={editor.setMinimap} />
      </SettingRow>
      <SettingRow
        label="Line numbers"
        description={
          <Flex align="center" gap="4px">
            <Hash size={11} /> Display line numbers in the gutter.
          </Flex>
        }
      >
        <SettingToggle
          value={editor.lineNumbers}
          onChange={editor.setLineNumbers}
        />
      </SettingRow>
    </SettingsSection>
  );
}
