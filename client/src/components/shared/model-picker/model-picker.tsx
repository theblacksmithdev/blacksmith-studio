import { useModels } from "@/api/hooks/ai";
import { ModelGrid } from "./model-grid";
import { ModelDropdown } from "./model-dropdown";

interface CommonProps {
  value: string | null | undefined;
  onChange: (id: string) => void;
}

export type ModelPickerProps =
  | ({ variant: "grid" } & CommonProps)
  | ({
      variant: "dropdown";
      placement?: "up" | "down";
      compact?: boolean;
    } & CommonProps);

/**
 * Unified entry point for model selection. Renders whichever variant
 * the mount site prefers (grid for settings, dropdown for composer
 * and agent cards) — all driven off the same registry data.
 *
 * Consumes `useModels()` so every mount site shares one cached query.
 */
export function ModelPicker(props: ModelPickerProps) {
  const { data: models } = useModels();
  if (!models || models.length === 0) return null;

  if (props.variant === "grid") {
    return (
      <ModelGrid
        models={models}
        value={props.value}
        onChange={props.onChange}
      />
    );
  }
  return (
    <ModelDropdown
      models={models}
      value={props.value}
      onChange={props.onChange}
      placement={props.placement}
      compact={props.compact}
    />
  );
}
