export type EdgeType = "smoothstep" | "default" | "step" | "straight";

export interface CanvasSettings {
  edgeType: EdgeType;
  edgeWidth: number;
  edgeActiveWidth: number;
  edgeOpacity: number;
  edgeAnimated: boolean;
  showBackground: boolean;
  backgroundGap: number;
  backgroundSize: number;
  snapToGrid: boolean;
  snapGridSize: number;
}

export const CANVAS_DEFAULTS: CanvasSettings = {
  edgeType: "smoothstep",
  edgeWidth: 1,
  edgeActiveWidth: 1.5,
  edgeOpacity: 0.35,
  edgeAnimated: true,
  showBackground: true,
  backgroundGap: 28,
  backgroundSize: 0.8,
  snapToGrid: false,
  snapGridSize: 20,
};

export const EDGE_TYPE_OPTIONS: { value: EdgeType; label: string }[] = [
  { value: "smoothstep", label: "Smooth Step" },
  { value: "default", label: "Bezier" },
  { value: "step", label: "Step" },
  { value: "straight", label: "Straight" },
];
