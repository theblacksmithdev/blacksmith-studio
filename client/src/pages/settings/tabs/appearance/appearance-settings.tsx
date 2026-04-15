import { Flex } from "@chakra-ui/react";
import { useAppearanceSettings } from "./hooks/use-appearance-settings";
import { ThemeSelector } from "./components/theme-selector";
import { InterfaceSection } from "./components/interface-section";

export function AppearanceSettings() {
  const appearance = useAppearanceSettings();

  return (
    <Flex direction="column" gap="28px">
      <ThemeSelector
        theme={appearance.theme}
        onThemeChange={appearance.setTheme}
      />
      <InterfaceSection
        fontSize={appearance.fontSize}
        sidebarCollapsed={appearance.sidebarCollapsed}
        onFontSizeChange={appearance.setFontSize}
        onSidebarChange={appearance.setSidebarCollapsed}
      />
    </Flex>
  );
}
