import { useMemo } from "react";
import {
  MoreVertical,
  Eye,
  BotMessageSquare,
  Trash2,
  PackageOpen,
} from "lucide-react";
import { Menu, IconButton } from "@/components/shared/ui";
import type { MenuOption } from "@/components/shared/ui";

interface ServiceMenuProps {
  hasSetupCommand: boolean;
  onSetup: () => void;
  onViewDetails: () => void;
  onDiagnose: () => void;
  onDelete: () => void;
}

export function ServiceMenu({
  hasSetupCommand,
  onSetup,
  onViewDetails,
  onDiagnose,
  onDelete,
}: ServiceMenuProps) {
  const options: MenuOption[] = useMemo(
    () => [
      ...(hasSetupCommand
        ? [{ icon: <PackageOpen />, label: "Run Setup", onClick: onSetup }]
        : []),
      { icon: <Eye />, label: "View Details", onClick: onViewDetails },
      {
        icon: <BotMessageSquare />,
        label: "Diagnose with AI",
        onClick: onDiagnose,
      },
      {
        icon: <Trash2 />,
        label: "Remove",
        onClick: onDelete,
        danger: true,
        separator: true,
      },
    ],
    [hasSetupCommand, onSetup, onViewDetails, onDiagnose, onDelete],
  );

  return (
    <Menu
      trigger={
        <IconButton
          variant="ghost"
          size="xs"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          aria-label="More options"
        >
          <MoreVertical />
        </IconButton>
      }
      options={options}
    />
  );
}
