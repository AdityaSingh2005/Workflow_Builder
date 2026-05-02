"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import { Bot, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TypedHandle } from "@/components/workflow/handles/typed-handle";
import { NodeRow } from "@/components/workflow/nodes/node-row";
import { NodeShell } from "@/components/workflow/nodes/node-shell";
import { getConnectedTargetHandles } from "@/lib/graph/workflow-graph-validation";
import { useWorkflowBuilderStore } from "@/store/workflow-builder-store";
import type { GeminiNodeData } from "@/types/workflow";

type GeminiFlowNode = Node<GeminiNodeData, "gemini">;

export function GeminiNode({ id, data, selected }: NodeProps<GeminiFlowNode>) {
  const edges = useWorkflowBuilderStore((state) => state.edges);
  const connectedHandles = useMemo(
    () => getConnectedTargetHandles(id, edges),
    [edges, id],
  );
  const running = useWorkflowBuilderStore((state) =>
    state.runningNodeIds.includes(id),
  );
  const promptConnected = connectedHandles.has("prompt");
  const systemPromptConnected = connectedHandles.has("systemPrompt");

  return (
    <NodeShell
      className="w-[300px]"
      icon={<Bot aria-hidden="true" className="size-4" />}
      nodeId={id}
      running={running}
      selected={selected}
      title={data.label}
    >
      <div className="border-b border-border-secondary px-3 py-2">
        <select
          className="h-8 w-full rounded-control border border-border-primary bg-layer-2 px-2 text-xs font-semibold text-text-primary outline-none"
          value={data.modelLabel}
          disabled
        >
          <option>Gemini 3.1 Pro</option>
        </select>
      </div>

      <div className="divide-y divide-border-secondary py-1">
        <NodeRow connected={promptConnected} label="Prompt" required>
          <Textarea
            disabled={promptConnected}
            placeholder="Enter prompt..."
            readOnly
            value={data.prompt ?? ""}
          />
          <TypedHandle
            dataType="text"
            id="prompt"
            position={Position.Left}
            type="target"
          />
        </NodeRow>

        <NodeRow connected={systemPromptConnected} label="System Prompt">
          <Input
            disabled={systemPromptConnected}
            placeholder="Optional instructions..."
            readOnly
            value={data.systemPrompt ?? ""}
          />
          <TypedHandle
            dataType="text"
            id="systemPrompt"
            position={Position.Left}
            type="target"
          />
        </NodeRow>

        {(
          [
            { label: "Image (Vision)", idValue: "image", dataType: "image" },
            { label: "Video", idValue: "video", dataType: "video" },
            { label: "Audio", idValue: "audio", dataType: "audio" },
            { label: "File", idValue: "file", dataType: "file" },
          ] as const
        ).map(({ label, idValue, dataType }) => (
          <NodeRow
            connected={connectedHandles.has(idValue)}
            key={idValue}
            label={label}
          >
            <div className="rounded-control bg-layer-2 px-2 py-2 text-[11px] text-text-tertiary">
              {connectedHandles.has(idValue) ? "Connected" : "No input"}
            </div>
            <TypedHandle
              dataType={dataType}
              id={idValue}
              position={Position.Left}
              type="target"
            />
          </NodeRow>
        ))}

        <button
          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-text-tertiary"
          type="button"
        >
          <ChevronRight aria-hidden="true" className="size-3" />
          Settings
        </button>

        <NodeRow label="Response">
          <div className="grid min-h-20 place-items-center rounded-control bg-layer-2 px-3 py-3 text-center text-[11px] text-text-tertiary">
            {data.responseText ?? "No output yet"}
          </div>
          <TypedHandle
            dataType="text"
            id="response"
            position={Position.Right}
            type="source"
          />
        </NodeRow>
      </div>
    </NodeShell>
  );
}
