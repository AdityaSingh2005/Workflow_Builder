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
  previewUrl: z.string().optional(),
});

export const requestInputsNodeDataSchema = z.object({
  label: z.literal("Request-Inputs"),
  fields: z.array(requestInputFieldSchema),
});

export const cropImageNodeDataSchema = z.object({
  label: z.string().min(1),
  inputImageUrl: z.string().optional(),
  xPercent: z.number().min(0).max(100),
  yPercent: z.number().min(0).max(100),
  widthPercent: z.number().min(0).max(100),
  heightPercent: z.number().min(0).max(100),
  outputImageUrl: z.string().optional(),
});

export const geminiNodeDataSchema = z.object({
  label: z.string().min(1),
  modelLabel: z.string().min(1),
  modelId: z.string().optional(),
  prompt: z.string().optional(),
  systemPrompt: z.string().optional(),
  imageUrls: z.array(z.string()),
  videoUrls: z.array(z.string()),
  audioUrls: z.array(z.string()),
  fileUrls: z.array(z.string()),
  settingsCollapsed: z.boolean(),
  responseText: z.string().optional(),
});

export const responseNodeDataSchema = z.object({
  label: z.literal("Response"),
  result: z.string().optional(),
});

export const workflowNodeSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1),
    type: z.literal("requestInputs"),
    position: workflowPositionSchema,
    data: requestInputsNodeDataSchema,
    locked: z.boolean().optional(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("cropImage"),
    position: workflowPositionSchema,
    data: cropImageNodeDataSchema,
    locked: z.boolean().optional(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("gemini"),
    position: workflowPositionSchema,
    data: geminiNodeDataSchema,
    locked: z.boolean().optional(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("response"),
    position: workflowPositionSchema,
    data: responseNodeDataSchema,
    locked: z.boolean().optional(),
  }),
]);

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
