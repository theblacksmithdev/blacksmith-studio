import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Layers } from "lucide-react";
import { ROLE_ICONS } from "../shared/role-icons";
import type { AgentNodeData } from "./types";
import {
  NodeWrapper,
  IconWrap,
  Title,
  Activity,
  StatusDot,
  handleStyle,
} from "./styles";

function AgentNodeComponent({ data }: NodeProps & { data: AgentNodeData }) {
  const Icon = ROLE_ICONS[data.role] ?? Layers;
  const isActive = data.status === "executing" || data.status === "thinking";
  const isCenter = data.isCenter;

  const statusLabel =
    data.activity ??
    (data.status === "idle"
      ? isCenter
        ? "Awaiting tasks"
        : "Ready"
      : data.status === "thinking"
        ? isCenter
          ? "Planning..."
          : "Thinking..."
        : data.status === "executing"
          ? isCenter
            ? "Dispatching..."
            : "Working..."
          : data.status === "done"
            ? "Complete"
            : data.status === "error"
              ? "Failed"
              : "");

  return (
    <>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <NodeWrapper
        $status={data.status}
        $selected={data.selected}
        $isCenter={isCenter}
      >
        <StatusDot $status={data.status} />
        <IconWrap $active={isActive} $isCenter={isCenter}>
          <Icon size={isCenter ? 18 : 15} />
        </IconWrap>
        <Title $isCenter={isCenter}>{data.title}</Title>
        <Activity $status={data.status}>{statusLabel}</Activity>
      </NodeWrapper>
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </>
  );
}

export const AgentNode = memo(AgentNodeComponent);
