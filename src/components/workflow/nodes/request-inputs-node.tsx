"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import { Plus, Rows3 } from "lucide-react";

import { TypedHandle } from "@/components/workflow/handles/typed-handle";
import { NodeRow } from "@/components/workflow/nodes/node-row";
import { NodeShell } from "@/components/workflow/nodes/node-shell";
import type { RequestInputsNodeData } from "@/types/workflow";

type RequestInputsFlowNode = Node<RequestInputsNodeData, "requestInputs">;

export function RequestInputsNode({
  id,
  data,
  selected,
}: NodeProps<RequestInputsFlowNode>) {
  return (
    <NodeShell
      icon={<Rows3 aria-hidden="true" className="size-4" />}
      locked
      nodeId={id}
      selected={selected}
      title={data.label}
    >
      <div className="divide-y divide-border-secondary py-1">
        {data.fields.length === 0 ? (
          <div className="px-3 py-4 text-xs text-text-tertiary">
            No inputs configured
          </div>
        ) : (
          data.fields.map((field) => (
            <NodeRow key={field.id} label={field.name}>
              <div className="rounded-control border border-border-primary bg-layer-2 px-2 py-2 text-xs text-text-tertiary">
                {field.value || "Empty"}
              </div>
              <TypedHandle
                dataType={field.type === "image_field" ? "image" : "text"}
                id={`field:${field.id}`}
                position={Position.Right}
                type="source"
              />
            </NodeRow>
          ))
        )}
      </div>
      <div className="border-t border-border-secondary px-3 py-2">
        <button
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-tertiary"
          type="button"
        >
          <Plus aria-hidden="true" className="size-3" />
          Add input
        </button>
      </div>
    </NodeShell>
  );
}
