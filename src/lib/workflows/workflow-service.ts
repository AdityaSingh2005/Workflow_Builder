import { Prisma, WorkflowStatus } from "@/generated/prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { createDefaultWorkflowGraph } from "@/lib/graph/create-default-workflow-graph";
import { createSampleWorkflowGraph } from "@/lib/graph/create-sample-workflow-graph";
import {
  mapWorkflowToDetail,
  mapWorkflowToSummary,
} from "@/lib/workflows/workflow-mappers";
import type { WorkflowGraph, WorkflowId } from "@/types/workflow";

export async function listWorkflowSummaries(clerkUserId: string) {
  const prisma = getPrismaClient();
  const workflows = await prisma.workflow.findMany({
    where: {
      clerkUserId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true,
    },
  });

  return workflows.map(mapWorkflowToSummary);
}

export async function createWorkflow(clerkUserId: string, name: string) {
  return createWorkflowFromGraph(clerkUserId, name, createDefaultWorkflowGraph());
}

export async function createWorkflowFromGraph(
  clerkUserId: string,
  name: string,
  graph: WorkflowGraph,
) {
  const prisma = getPrismaClient();
  const workflow = await prisma.workflow.create({
    data: {
      clerkUserId,
      name,
      graph: graph as unknown as Prisma.InputJsonValue,
      status: WorkflowStatus.IDLE,
    },
  });

  return mapWorkflowToDetail(workflow);
}

export async function createSampleWorkflow(clerkUserId: string) {
  return createWorkflowFromGraph(
    clerkUserId,
    "Sample Marketing Workflow",
    createSampleWorkflowGraph(),
  );
}

export async function getWorkflowForUser(
  clerkUserId: string,
  workflowId: WorkflowId,
) {
  const prisma = getPrismaClient();
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      clerkUserId,
    },
  });

  if (!workflow) {
    return null;
  }

  return mapWorkflowToDetail(workflow);
}

export async function updateWorkflow(
  clerkUserId: string,
  workflowId: WorkflowId,
  input: {
    name?: string;
    graph?: WorkflowGraph;
  },
) {
  const prisma = getPrismaClient();

  return prisma.$transaction(async (transaction) => {
    const existingWorkflow = await transaction.workflow.findFirst({
      where: {
        id: workflowId,
        clerkUserId,
      },
      select: {
        id: true,
      },
    });

    if (!existingWorkflow) {
      return null;
    }

    const updatedWorkflow = await transaction.workflow.update({
      where: {
        id: existingWorkflow.id,
      },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.graph !== undefined
          ? { graph: input.graph as unknown as Prisma.InputJsonValue }
          : {}),
      },
    });

    return mapWorkflowToDetail(updatedWorkflow);
  });
}

export async function renameWorkflow(
  clerkUserId: string,
  workflowId: WorkflowId,
  name: string,
) {
  return updateWorkflow(clerkUserId, workflowId, { name });
}

export async function saveWorkflowGraph(
  clerkUserId: string,
  workflowId: WorkflowId,
  graph: WorkflowGraph,
) {
  return updateWorkflow(clerkUserId, workflowId, { graph });
}

export async function deleteWorkflow(
  clerkUserId: string,
  workflowId: WorkflowId,
) {
  const prisma = getPrismaClient();
  const result = await prisma.workflow.deleteMany({
    where: {
      id: workflowId,
      clerkUserId,
    },
  });

  return result.count > 0;
}
