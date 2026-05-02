import type { NodeRun, WorkflowRun as PrismaWorkflowRun } from "@/generated/prisma/client";
import type { WorkflowRun } from "@/types/workflow";

function mapRunScope(scope: PrismaWorkflowRun["scope"]): WorkflowRun["scope"] {
  return scope.toLowerCase() as WorkflowRun["scope"];
}

function mapRunStatus(status: PrismaWorkflowRun["status"]): WorkflowRun["status"] {
  return status.toLowerCase() as WorkflowRun["status"];
}

function mapNodeRunStatus(status: NodeRun["status"]) {
  return status.toLowerCase() as WorkflowRun["nodeRuns"][number]["status"];
}

export function mapWorkflowRun(
  run: PrismaWorkflowRun & {
    nodeRuns: NodeRun[];
  },
): WorkflowRun {
  return {
    id: run.id,
    workflowId: run.workflowId,
    scope: mapRunScope(run.scope),
    status: mapRunStatus(run.status),
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString(),
    durationMs: run.durationMs ?? undefined,
    nodeRuns: run.nodeRuns.map((nodeRun) => ({
      nodeId: nodeRun.nodeId,
      nodeLabel: nodeRun.nodeLabel,
      nodeType: nodeRun.nodeType as WorkflowRun["nodeRuns"][number]["nodeType"],
      status: mapNodeRunStatus(nodeRun.status),
      inputs: nodeRun.inputs,
      output: nodeRun.output,
      error: nodeRun.error ?? undefined,
      startedAt: nodeRun.startedAt?.toISOString(),
      finishedAt: nodeRun.finishedAt?.toISOString(),
      durationMs: nodeRun.durationMs ?? undefined,
    })),
  };
}

