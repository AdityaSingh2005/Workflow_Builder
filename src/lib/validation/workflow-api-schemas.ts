import { z } from "zod";

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

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;

