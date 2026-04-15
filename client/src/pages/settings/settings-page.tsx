import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { SplitPanel } from "@/components/shared/layout";
import { SettingsSidebar } from "./components";

export default function SettingsPage() {
  return (
    <SplitPanel
      left={<SettingsSidebar />}
      defaultWidth={220}
      minWidth={180}
      maxWidth={320}
      storageKey="settings.sidebarWidth"
    >
      <Box
        css={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 40px 64px",
        }}
      >
        <Box css={{ maxWidth: "600px", margin: "0 auto" }}>
          <Outlet />
        </Box>
      </Box>
    </SplitPanel>
  );
}
