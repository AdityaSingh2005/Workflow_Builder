import type { Workflow as PrismaWorkflow } from "@/generated/prisma/client";
import { WorkflowStatus } from "@/generated/prisma/enums";
import { workflowGraphSchema } from "@/lib/validation/workflow-schemas";
import type { WorkflowDetail, WorkflowSummary } from "@/types/workflow";

export function mapWorkflowStatus(status: PrismaWorkflow["status"]) {
  return status === WorkflowStatus.RUNNING ? "running" : "idle";
}

export function mapWorkflowToSummary(
  workflow: Pick<PrismaWorkflow, "id" | "name" | "status" | "updatedAt">,
): WorkflowSummary {
  return {
    id: workflow.id,
    name: workflow.name,
    status: mapWorkflowStatus(workflow.status),
    updatedAt: workflow.updatedAt.toISOString(),
  };
}

export function mapWorkflowToDetail(workflow: PrismaWorkflow): WorkflowDetail {
  return {
    id: workflow.id,
    name: workflow.name,
    status: mapWorkflowStatus(workflow.status),
    graph: workflowGraphSchema.parse(workflow.graph),
    createdAt: workflow.createdAt.toISOString(),
    updatedAt: workflow.updatedAt.toISOString(),
  };
}

