"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import { MessageSquareReply } from "lucide-react";
import { useMemo } from "react";

import { TypedHandle } from "@/components/workflow/handles/typed-handle";
import { NodeRow } from "@/components/workflow/nodes/node-row";
import { NodeShell } from "@/components/workflow/nodes/node-shell";
import { getConnectedTargetHandles } from "@/lib/graph/workflow-graph-validation";
import { useWorkflowBuilderStore } from "@/store/workflow-builder-store";
import type { ResponseNodeData } from "@/types/workflow";

type ResponseFlowNode = Node<ResponseNodeData, "response">;

export function ResponseNode({
  id,
  data,
  selected,
}: NodeProps<ResponseFlowNode>) {
  const edges = useWorkflowBuilderStore((state) => state.edges);
  const connectedHandles = useMemo(
    () => getConnectedTargetHandles(id, edges),
    [edges, id],
  );

  return (
    <NodeShell
      icon={<MessageSquareReply aria-hidden="true" className="size-4" />}
      locked
      nodeId={id}
      selected={selected}
      title={data.label}
    >
      <NodeRow connected={connectedHandles.has("result")} label="result">
        <div className="grid min-h-24 place-items-center rounded-control bg-layer-2 px-3 py-3 text-center text-[11px] text-text-tertiary">
          {data.result ?? "No output yet"}
        </div>
        <TypedHandle
          dataType="text"
          id="result"
          position={Position.Left}
          type="target"
        />
      </NodeRow>
    </NodeShell>
  );
}
