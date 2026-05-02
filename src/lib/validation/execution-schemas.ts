import { z } from "zod";

export const runWorkflowRequestSchema = z
  .object({
    scope: z.enum(["full", "partial", "single"]),
    nodeIds: z.array(z.string().min(1)).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.scope === "full" ||
      (Array.isArray(value.nodeIds) && value.nodeIds.length > 0),
    {
      message: "Single and partial runs require at least one node id.",
      path: ["nodeIds"],
    },
  );

export const cropImageTaskInputSchema = z.object({
  workflowId: z.string().min(1),
  runId: z.string().min(1),
  nodeId: z.string().min(1),
  inputImageUrl: z.string().min(1),
  xPercent: z.number().min(0).max(100),
  yPercent: z.number().min(0).max(100),
  widthPercent: z.number().min(0).max(100),
  heightPercent: z.number().min(0).max(100),
});

export const cropImageTaskOutputSchema = z.object({
  outputImageUrl: z.string().min(1),
});

export const geminiTaskInputSchema = z.object({
  workflowId: z.string().min(1),
  runId: z.string().min(1),
  nodeId: z.string().min(1),
  modelLabel: z.string().min(1),
  modelId: z.string().min(1),
  prompt: z.string().min(1),
  systemPrompt: z.string().optional(),
  imageUrls: z.array(z.string()).default([]),
  videoUrls: z.array(z.string()).default([]),
  audioUrls: z.array(z.string()).default([]),
  fileUrls: z.array(z.string()).default([]),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const geminiTaskOutputSchema = z.object({
  responseText: z.string(),
  usage: z
    .object({
      inputTokens: z.number().optional(),
      outputTokens: z.number().optional(),
      totalTokens: z.number().optional(),
    })
    .optional(),
});

export type RunWorkflowRequestInput = z.infer<typeof runWorkflowRequestSchema>;
export type CropImageTaskInput = z.infer<typeof cropImageTaskInputSchema>;
export type CropImageTaskOutput = z.infer<typeof cropImageTaskOutputSchema>;
export type GeminiTaskInput = z.infer<typeof geminiTaskInputSchema>;
export type GeminiTaskOutput = z.infer<typeof geminiTaskOutputSchema>;
