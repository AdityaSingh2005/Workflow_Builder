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
  const updateCropImageNode = useWorkflowBuilderStore(
    (state) => state.updateCropImageNode,
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
            onChange={(event) =>
              updateCropImageNode(id, {
                inputImageUrl: event.target.value,
              })
            }
            placeholder="Paste image URL..."
            value={data.inputImageUrl ?? ""}
          />
          <TypedHandle
            dataType="image"
            id="inputImage"
            position={Position.Left}
            type="target"
          />
        </NodeRow>

        <div className="grid grid-cols-2 gap-2 px-3 py-2">
          {(
            [
              ["X Position", "xPercent", data.xPercent],
              ["Y Position", "yPercent", data.yPercent],
              ["Width", "widthPercent", data.widthPercent],
              ["Height", "heightPercent", data.heightPercent],
            ] as const
          ).map(([label, key, value]) => (
            <label className="flex flex-col gap-1" key={label}>
              <span className="text-[10px] font-medium text-text-tertiary">
                {label} %
              </span>
              <Input
                disabled={connectedHandles.has(key)}
                max={100}
                min={0}
                onChange={(event) =>
                  updateCropImageNode(id, {
                    [key]: Math.max(
                      0,
                      Math.min(100, Number(event.target.value)),
                    ),
                  })
                }
                type="number"
                value={value}
              />
              <TypedHandle
                dataType="text"
                id={key}
                position={Position.Left}
                type="target"
              />
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
