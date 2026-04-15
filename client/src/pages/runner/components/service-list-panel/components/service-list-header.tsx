import { Flex } from "@chakra-ui/react";
import { Play, Square, Plus } from "lucide-react";
import { Text, IconButton, Tooltip, spacing } from "@/components/shared/ui";

interface ServiceListHeaderProps {
  hasServices: boolean;
  anyActive: boolean;
  onAdd: () => void;
  onStartAll: () => void;
  onStopAll: () => void;
}

export function ServiceListHeader({
  hasServices,
  anyActive,
  onAdd,
  onStartAll,
  onStopAll,
}: ServiceListHeaderProps) {
  return (
    <Flex
      align="center"
      justify="space-between"
      css={{ padding: `${spacing.sm} ${spacing.md}`, flexShrink: 0 }}
    >
      <Text variant="tiny" color="muted">
        Services
      </Text>
      <Flex align="center" gap={spacing.xs}>
        <Tooltip content="Add service">
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onAdd}
            aria-label="Add service"
          >
            <Plus />
          </IconButton>
        </Tooltip>
        {hasServices && (
          <Tooltip content={anyActive ? "Stop all" : "Start all"}>
            <IconButton
              variant={anyActive ? "danger" : "ghost"}
              size="sm"
              onClick={anyActive ? onStopAll : onStartAll}
              aria-label={anyActive ? "Stop all" : "Start all"}
            >
              {anyActive ? (
                <Square size={10} fill="currentColor" />
              ) : (
                <Play size={12} />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Flex>
    </Flex>
  );
}
