import { z } from "zod";

import { WORKFLOW_GRAPH_SCHEMA_VERSION } from "@/config/workflow";
import { workflowGraphSchema } from "@/lib/validation/workflow-schemas";

export const workflowNameSchema = z
  .string()
  .trim()
  .min(1, "Workflow name is required.")
  .max(80, "Workflow name must be 80 characters or fewer.");

export const createWorkflowSchema = z
  .object({
    name: workflowNameSchema.optional(),
  })
  .strict()
  .optional()
  .transform((value) => ({
    name: value?.name ?? "Untitled Workflow",
  }));

export const updateWorkflowSchema = z
  .object({
    name: workflowNameSchema.optional(),
    graph: workflowGraphSchema.optional(),
  })
  .strict()
  .refine((value) => value.name !== undefined || value.graph !== undefined, {
    message: "Provide a workflow name or graph update.",
  });

export const exportedWorkflowSchema = z
  .object({
    application: z.literal("NextFlow"),
    schemaVersion: z.literal(WORKFLOW_GRAPH_SCHEMA_VERSION),
    exportedAt: z.string().datetime(),
    name: workflowNameSchema,
    graph: workflowGraphSchema,
  })
  .strict();

export const importWorkflowSchema = z.union([
  workflowGraphSchema.transform((graph) => ({ graph })),
  exportedWorkflowSchema.transform((value) => ({ graph: value.graph })),
]);

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type ExportedWorkflowInput = z.infer<typeof exportedWorkflowSchema>;
export type ImportWorkflowInput = z.infer<typeof importWorkflowSchema>;
