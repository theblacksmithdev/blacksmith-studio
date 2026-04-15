import { Flex } from "@chakra-ui/react";
import { Shield, DollarSign } from "lucide-react";
import { SettingsSection } from "@/pages/settings/components/settings-section";
import { SettingRow } from "@/pages/settings/components/setting-row";
import { SettingInput } from "@/pages/settings/components/setting-input";
import { SegmentedControl } from "@/pages/settings/components/segmented-control";
import { PERMISSION_OPTIONS } from "../hooks/use-ai-settings";

interface BehaviorSectionProps {
  permissionMode: string;
  maxBudget: number | null;
  onPermissionChange: (value: string) => void;
  onBudgetChange: (value: number | string | null) => void;
}

export function BehaviorSection({
  permissionMode,
  maxBudget,
  onPermissionChange,
  onBudgetChange,
}: BehaviorSectionProps) {
  return (
    <SettingsSection
      title="Behavior"
      description="Control how Claude interacts with your project."
    >
      <SettingRow
        label="Permissions"
        description={
          <Flex align="center" gap="4px">
            <Shield size={11} /> How Claude handles file edits and shell
            commands.
          </Flex>
        }
      >
        <SegmentedControl
          value={permissionMode}
          options={[...PERMISSION_OPTIONS]}
          onChange={onPermissionChange}
        />
      </SettingRow>
      <SettingRow
        label="Budget limit"
        description={
          <Flex align="center" gap="4px">
            <DollarSign size={11} /> Max USD per prompt. Leave empty for
            unlimited.
          </Flex>
        }
      >
        <SettingInput
          value={maxBudget ?? ""}
          type="number"
          placeholder="No limit"
          prefix="$"
          suffix="per prompt"
          onChange={onBudgetChange}
        />
      </SettingRow>
    </SettingsSection>
  );
}
