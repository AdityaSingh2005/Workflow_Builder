"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import { ImageIcon, Rows3, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TypedHandle } from "@/components/workflow/handles/typed-handle";
import { NodeRow } from "@/components/workflow/nodes/node-row";
import { NodeShell } from "@/components/workflow/nodes/node-shell";
import { useWorkflowBuilderStore } from "@/store/workflow-builder-store";
import type { RequestInputsNodeData } from "@/types/workflow";

type RequestInputsFlowNode = Node<RequestInputsNodeData, "requestInputs">;

export function RequestInputsNode({
  id,
  data,
  selected,
}: NodeProps<RequestInputsFlowNode>) {
  const addRequestInputField = useWorkflowBuilderStore(
    (state) => state.addRequestInputField,
  );
  const updateRequestInputField = useWorkflowBuilderStore(
    (state) => state.updateRequestInputField,
  );

  async function uploadImageField(fieldId: string, file: File) {
    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch("/api/upload/transloadit", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { url: string };
    updateRequestInputField(id, fieldId, {
      value: payload.url,
      previewUrl: payload.url,
    });
  }

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
              <Input
                aria-label={`${field.name} name`}
                value={field.name}
                onChange={(event) =>
                  updateRequestInputField(id, field.id, {
                    name: event.target.value,
                  })
                }
              />
              {field.type === "text_field" ? (
                <Textarea
                  aria-label={`${field.name} value`}
                  placeholder="Enter text..."
                  value={field.value}
                  onChange={(event) =>
                    updateRequestInputField(id, field.id, {
                      value: event.target.value,
                    })
                  }
                />
              ) : (
                <div className="space-y-2">
                  {field.previewUrl || field.value ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={field.name}
                      className="h-24 w-full rounded-control border border-border-primary object-cover"
                      src={field.previewUrl ?? field.value}
                    />
                  ) : (
                    <div className="grid h-24 place-items-center rounded-control border border-dashed border-border-primary bg-layer-2 text-xs text-text-tertiary">
                      Upload image
                    </div>
                  )}
                  <input
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="block w-full text-xs text-text-secondary file:mr-2 file:rounded-control file:border-0 file:bg-primary-soft file:px-2 file:py-1 file:text-xs file:font-semibold file:text-primary"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        void uploadImageField(field.id, file);
                      }
                    }}
                    type="file"
                  />
                </div>
              )}
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
        <div className="flex gap-2">
          <Button
            className="h-7 flex-1 text-[11px]"
            onClick={() => addRequestInputField(id, "text_field")}
            size="sm"
            variant="ghost"
          >
            <Type aria-hidden="true" className="size-3" />
            Text
          </Button>
          <Button
            className="h-7 flex-1 text-[11px]"
            onClick={() => addRequestInputField(id, "image_field")}
            size="sm"
            variant="ghost"
          >
            <ImageIcon aria-hidden="true" className="size-3" />
            Image
          </Button>
        </div>
      </div>
    </NodeShell>
  );
}
