import { PanelLeft } from "lucide-react";
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

export function ProjectTitleBar() {
  const { project, pageName, isHome, toggleSidebar } = useTitleBar();

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
    />
  );
}
