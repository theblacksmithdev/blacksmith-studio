import { useNavigate } from "react-router-dom";
import { ArrowUpRight, LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { Logo, PopupMenu } from "@/components/shared/ui";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { Path, settingsPath } from "@/router/paths";
import { SidebarTooltip } from "../sidebar-tooltip";
import { BRAND_LINKS } from "./brand-links";
import {
  Avatar,
  AvatarBtn,
  AvatarLabel,
  BrandChip,
  BrandChipArrow,
  BrandChipLabel,
  BrandRow,
  Header,
  HeaderCaption,
  HeaderLogoSlot,
  HeaderText,
  HeaderTitle,
  Item,
  ItemLabel,
  Sections,
} from "./styles";

interface UserMenuProps {
  expanded: boolean;
}

/** First page the "Settings" entry lands on — mirrors the settings nav. */
const SETTINGS_LANDING_TAB = "appearance";

/**
 * Sidebar avatar → popover menu.
 *
 * Surface, top → bottom:
 *   1. Brand header (logo + wordmark + caption)
 *   2. Main actions (Settings → appearance, theme toggle, exit project)
 *   3. Subtle brand-link chip row (Academic / Community)
 */
export function UserMenu({ expanded }: UserMenuProps) {
  const navigate = useNavigate();
  const projectId = useActiveProjectId();
  const { mode, toggle } = useThemeMode();

  if (!projectId) {
    return (
      <SidebarTooltip label="Menu" visible={!expanded}>
        <AvatarBtn expanded={expanded} disabled>
          <Avatar>
            <User size={12} />
          </Avatar>
          <AvatarLabel visible={expanded}>Menu</AvatarLabel>
        </AvatarBtn>
      </SidebarTooltip>
    );
  }

  const ThemeIcon = mode === "dark" ? Sun : Moon;
  const themeLabel = `Switch to ${mode === "dark" ? "light" : "dark"} mode`;

  return (
    <SidebarTooltip label="Menu" visible={!expanded}>
      <PopupMenu
        placement="top-start"
        minWidth={280}
        padding={0}
        radius={14}
        background="var(--studio-bg-surface)"
        trigger={
          <AvatarBtn expanded={expanded}>
            <Avatar>
              <User size={12} />
            </Avatar>
            <AvatarLabel visible={expanded}>Menu</AvatarLabel>
          </AvatarBtn>
        }
      >
        <Header>
          <HeaderLogoSlot>
            <Logo size={18} variant="brand" />
          </HeaderLogoSlot>
          <HeaderText>
            <HeaderTitle>Blacksmith Studio</HeaderTitle>
            <HeaderCaption>Project menu</HeaderCaption>
          </HeaderText>
        </Header>

        <Sections>
          <Item
            value="settings"
            onClick={() =>
              navigate(`${settingsPath(projectId)}/${SETTINGS_LANDING_TAB}`)
            }
          >
            <Settings />
            <ItemLabel>Settings</ItemLabel>
          </Item>
          <Item value="theme-toggle" onClick={toggle}>
            <ThemeIcon />
            <ItemLabel>{themeLabel}</ItemLabel>
          </Item>
          <Item
            value="exit-project"
            data-danger
            onClick={() => navigate(Path.Home)}
          >
            <LogOut />
            <ItemLabel>Exit project</ItemLabel>
          </Item>
        </Sections>

        <BrandRow>
          {BRAND_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <BrandChip
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                title={link.hint}
              >
                <Icon />
                <BrandChipLabel>{link.label}</BrandChipLabel>
                <BrandChipArrow className="brand-chip-arrow">
                  <ArrowUpRight size={11} />
                </BrandChipArrow>
              </BrandChip>
            );
          })}
        </BrandRow>
      </PopupMenu>
    </SidebarTooltip>
  );
}
