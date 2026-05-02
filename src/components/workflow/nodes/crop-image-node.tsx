"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import { Crop } from "lucide-react";
import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import { TypedHandle } from "@/components/workflow/handles/typed-handle";
import { NodeRow } from "@/components/workflow/nodes/node-row";
import { NodeShell } from "@/components/workflow/nodes/node-shell";
import { getConnectedTargetHandles } from "@/lib/graph/workflow-graph-validation";
import { useWorkflowBuilderStore } from "@/store/workflow-builder-store";
import type { CropImageNodeData } from "@/types/workflow";

type CropImageFlowNode = Node<CropImageNodeData, "cropImage">;

export function CropImageNode({
  id,
  data,
  selected,
}: NodeProps<CropImageFlowNode>) {
  const edges = useWorkflowBuilderStore((state) => state.edges);
  const connectedHandles = useMemo(
    () => getConnectedTargetHandles(id, edges),
    [edges, id],
  );
  const running = useWorkflowBuilderStore((state) =>
    state.runningNodeIds.includes(id),
  );
  const inputImageConnected = connectedHandles.has("inputImage");

  return (
    <NodeShell
      icon={<Crop aria-hidden="true" className="size-4" />}
      nodeId={id}
      running={running}
      selected={selected}
      title={data.label}
    >
      <div className="divide-y divide-border-secondary py-1">
        <NodeRow connected={inputImageConnected} label="Input Image" required>
          <Input
            disabled={inputImageConnected}
            placeholder="Paste image URL..."
            value={data.inputImageUrl ?? ""}
            readOnly
          />
          <TypedHandle
            dataType="image"
            id="inputImage"
            position={Position.Left}
            type="target"
          />
        </NodeRow>

        <div className="grid grid-cols-2 gap-2 px-3 py-2">
          {[
            ["X Position", data.xPercent],
            ["Y Position", data.yPercent],
            ["Width", data.widthPercent],
            ["Height", data.heightPercent],
          ].map(([label, value]) => (
            <label className="flex flex-col gap-1" key={label}>
              <span className="text-[10px] font-medium text-text-tertiary">
                {label} %
              </span>
              <Input readOnly type="number" value={value} />
            </label>
          ))}
        </div>

        <NodeRow label="Output Image">
          <div className="grid h-20 place-items-center rounded-control bg-layer-2 text-[11px] text-text-tertiary">
            {data.outputImageUrl ? "Image ready" : "No output yet"}
          </div>
          <TypedHandle
            dataType="image"
            id="outputImage"
            position={Position.Right}
            type="source"
          />
        </NodeRow>
      </div>
    </NodeShell>
  );
}
