import { PanelLeft, Terminal } from "lucide-react";
import { Tooltip } from "@/components/shared/tooltip";
import {
  TitleBarShell,
  NavBtn,
  TitleText,
  TitleTextBold,
  TitleSeparator,
} from "../title-bar-shell";
import { ModeToggle } from "./mode-toggle";
import { useTitleBar } from "./hooks/use-title-bar";
import { useTerminalPanel } from "@/hooks/use-terminal-panel";

export function ProjectTitleBar() {
  const { project, pageName, isHome, toggleSidebar } = useTitleBar();
  const [terminalOpen, toggleTerminal] = useTerminalPanel();

  return (
    <TitleBarShell
      leading={
        <Tooltip content="Toggle sidebar">
          <NavBtn onClick={toggleSidebar}>
            <PanelLeft size={15} />
          </NavBtn>
        </Tooltip>
      }
      center={
        isHome ? (
          <ModeToggle />
        ) : project ? (
          <>
            <TitleTextBold>{project.name}</TitleTextBold>
            {pageName && (
              <>
                <TitleSeparator>/</TitleSeparator>
                <TitleText>{pageName}</TitleText>
              </>
            )}
          </>
        ) : (
          <TitleText>Blacksmith Studio</TitleText>
        )
      }
      trailing={
        <Tooltip content="Terminal">
          <NavBtn onClick={toggleTerminal} style={{ color: terminalOpen ? "var(--studio-text-primary)" : undefined }}>
            <Terminal size={14} />
          </NavBtn>
        </Tooltip>
      }
    />
  );
}
