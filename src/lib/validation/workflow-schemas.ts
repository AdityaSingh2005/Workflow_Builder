import { z } from "zod";

import { WORKFLOW_GRAPH_SCHEMA_VERSION } from "@/config/workflow";

export const workflowNodeTypeSchema = z.enum([
  "requestInputs",
  "cropImage",
  "gemini",
  "response",
]);

export const workflowHandleDataTypeSchema = z.enum([
  "text",
  "image",
  "video",
  "audio",
  "file",
  "any",
]);

export const workflowPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const requestInputFieldSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["text_field", "image_field"]),
  value: z.string(),
});

export const workflowNodeSchema = z.object({
  id: z.string().min(1),
  type: workflowNodeTypeSchema,
  position: workflowPositionSchema,
  data: z.record(z.string(), z.unknown()),
  locked: z.boolean().optional(),
});

export const workflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  sourceHandle: z.string().min(1),
  target: z.string().min(1),
  targetHandle: z.string().min(1),
  dataType: workflowHandleDataTypeSchema,
});

export const workflowGraphSchema = z.object({
  schemaVersion: z.literal(WORKFLOW_GRAPH_SCHEMA_VERSION),
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
  viewport: z
    .object({
      x: z.number(),
      y: z.number(),
      zoom: z.number().positive(),
    })
    .optional(),
});

export type WorkflowGraphInput = z.infer<typeof workflowGraphSchema>;

