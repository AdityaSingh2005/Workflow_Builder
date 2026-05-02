import { tasks } from "@trigger.dev/sdk/v3";

import {
  NodeRunStatus,
  Prisma,
  RunScope,
  RunStatus,
  WorkflowStatus,
} from "@/generated/prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { mapWorkflowRun } from "@/lib/execution/workflow-run-mappers";
import { resolveGeminiModelId } from "@/config/gemini";
import { workflowGraphSchema } from "@/lib/validation/workflow-schemas";
import { mapWorkflowToDetail } from "@/lib/workflows/workflow-mappers";
import type {
  CropImageTaskInput,
  GeminiTaskInput,
} from "@/lib/validation/execution-schemas";
import type { cropImageTask } from "@/trigger/crop-image";
import type { geminiTask } from "@/trigger/gemini";
import type {
  CropImageNodeData,
  GeminiNodeData,
  RequestInputsNodeData,
  ResponseNodeData,
  RunWorkflowRequest,
  WorkflowGraph,
  WorkflowNode,
  WorkflowNodeId,
  WorkflowNodeType,
} from "@/types/workflow";

type NodeOutputValue = string | string[] | undefined;
type NodeOutputMap = Map<string, NodeOutputValue>;

type ExecutionNodeResult = {
  nodeId: string;
  nodeLabel: string;
  nodeType: WorkflowNodeType;
  status: "success" | "failed" | "skipped";
  inputs?: unknown;
  output?: unknown;
  error?: string;
  startedAt?: Date;
  finishedAt?: Date;
  durationMs?: number;
};

function toRunScope(scope: RunWorkflowRequest["scope"]) {
  return scope.toUpperCase() as RunScope;
}

function getNodeLabel(node: WorkflowNode) {
  return "label" in node.data ? node.data.label : node.type;
}

function outputKey(nodeId: string, handleId: string) {
  return `${nodeId}:${handleId}`;
}

function getIncomingEdges(nodeId: string, graph: WorkflowGraph) {
  return graph.edges.filter((edge) => edge.target === nodeId);
}

function getConnectedValues(
  nodeId: string,
  targetHandle: string,
  graph: WorkflowGraph,
  outputs: NodeOutputMap,
) {
  return getIncomingEdges(nodeId, graph)
    .filter((edge) => edge.targetHandle === targetHandle)
    .map((edge) => outputs.get(outputKey(edge.source, edge.sourceHandle)))
    .flat()
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

function getFirstConnectedValue(
  nodeId: string,
  targetHandle: string,
  graph: WorkflowGraph,
  outputs: NodeOutputMap,
) {
  return getConnectedValues(nodeId, targetHandle, graph, outputs)[0];
}

function seedRequestInputOutputs(graph: WorkflowGraph, outputs: NodeOutputMap) {
  for (const node of graph.nodes) {
    if (node.type !== "requestInputs") {
      continue;
    }

    const data = node.data as RequestInputsNodeData;

    for (const field of data.fields) {
      outputs.set(outputKey(node.id, `field:${field.id}`), field.value);
    }
  }
}

function getExecutableNodes(graph: WorkflowGraph) {
  return graph.nodes.filter(
    (node) => node.type === "cropImage" || node.type === "gemini",
  );
}

function getRequiredNodeIdsForTargets(
  graph: WorkflowGraph,
  targetNodeIds: string[],
) {
  const required = new Set<string>();
  const visit = (nodeId: string) => {
    if (required.has(nodeId)) {
      return;
    }

    required.add(nodeId);

    for (const edge of getIncomingEdges(nodeId, graph)) {
      visit(edge.source);
    }
  };

  targetNodeIds.forEach(visit);

  return required;
}

function getExecutionNodeSet(graph: WorkflowGraph, input: RunWorkflowRequest) {
  if (input.scope === "full") {
    return new Set(getExecutableNodes(graph).map((node) => node.id));
  }

  const requiredNodeIds = getRequiredNodeIdsForTargets(
    graph,
    input.nodeIds ?? [],
  );

  return new Set(
    getExecutableNodes(graph)
      .filter((node) => requiredNodeIds.has(node.id))
      .map((node) => node.id),
  );
}

function executableDependenciesReady(
  node: WorkflowNode,
  graph: WorkflowGraph,
  executableNodeIds: Set<string>,
  completedNodeIds: Set<string>,
) {
  return getIncomingEdges(node.id, graph)
    .map((edge) => edge.source)
    .filter((sourceNodeId) => executableNodeIds.has(sourceNodeId))
    .every((sourceNodeId) => completedNodeIds.has(sourceNodeId));
}

function resolveCropInputs(
  node: WorkflowNode,
  graph: WorkflowGraph,
  outputs: NodeOutputMap,
): CropImageTaskInput {
  const data = node.data as CropImageNodeData;
  const connectedImageUrl = getFirstConnectedValue(
    node.id,
    "inputImage",
    graph,
    outputs,
  );
  const inputImageUrl = connectedImageUrl ?? data.inputImageUrl;

  if (!inputImageUrl) {
    throw new Error("Crop Image requires an input image.");
  }

  const connectedNumber = (targetHandle: string, fallback: number) => {
    const value = getFirstConnectedValue(node.id, targetHandle, graph, outputs);
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    workflowId: graph.schemaVersion.toString(),
    runId: "",
    nodeId: node.id,
    inputImageUrl,
    xPercent: connectedNumber("xPercent", data.xPercent),
    yPercent: connectedNumber("yPercent", data.yPercent),
    widthPercent: connectedNumber("widthPercent", data.widthPercent),
    heightPercent: connectedNumber("heightPercent", data.heightPercent),
  };
}

function resolveGeminiInputs(
  node: WorkflowNode,
  graph: WorkflowGraph,
  outputs: NodeOutputMap,
): Omit<GeminiTaskInput, "workflowId" | "runId"> {
  const data = node.data as GeminiNodeData;
  const prompt =
    getFirstConnectedValue(node.id, "prompt", graph, outputs) ?? data.prompt;
  const systemPrompt =
    getFirstConnectedValue(node.id, "systemPrompt", graph, outputs) ??
    data.systemPrompt;
  const imageUrls = [
    ...getConnectedValues(node.id, "image", graph, outputs),
    ...data.imageUrls,
  ];
  const videoUrls = [
    ...getConnectedValues(node.id, "video", graph, outputs),
    ...data.videoUrls,
  ];
  const audioUrls = [
    ...getConnectedValues(node.id, "audio", graph, outputs),
    ...data.audioUrls,
  ];
  const fileUrls = [
    ...getConnectedValues(node.id, "file", graph, outputs),
    ...data.fileUrls,
  ];

  if (!prompt) {
    throw new Error("Gemini requires a prompt.");
  }

  return {
    nodeId: node.id,
    modelLabel: data.modelLabel,
    modelId: resolveGeminiModelId(data.modelLabel, data.modelId),
    prompt,
    systemPrompt,
    imageUrls,
    videoUrls,
    audioUrls,
    fileUrls,
  };
}

function updateGraphNodeOutput(
  graph: WorkflowGraph,
  node: WorkflowNode,
  output: unknown,
) {
  graph.nodes = graph.nodes.map((currentNode) => {
    if (currentNode.id !== node.id) {
      return currentNode;
    }

    if (node.type === "cropImage") {
      return {
        ...currentNode,
        data: {
          ...(currentNode.data as CropImageNodeData),
          outputImageUrl: (output as { outputImageUrl: string }).outputImageUrl,
        },
      };
    }

    if (node.type === "gemini") {
      return {
        ...currentNode,
        data: {
          ...(currentNode.data as GeminiNodeData),
          responseText: (output as { responseText: string }).responseText,
        },
      };
    }

    return currentNode;
  });
}

function resolveLocalResponseNodes(graph: WorkflowGraph, outputs: NodeOutputMap) {
  graph.nodes = graph.nodes.map((node) => {
    if (node.type !== "response") {
      return node;
    }

    const result = getFirstConnectedValue(node.id, "result", graph, outputs);

    return {
      ...node,
      data: {
        ...(node.data as ResponseNodeData),
        result,
      },
    };
  });
}

async function executeNode(
  workflowId: string,
  runId: string,
  node: WorkflowNode,
  graph: WorkflowGraph,
  outputs: NodeOutputMap,
): Promise<ExecutionNodeResult> {
  const startedAt = new Date();
  const nodeLabel = getNodeLabel(node);

  try {
    if (node.type === "cropImage") {
      const inputs = {
        ...resolveCropInputs(node, graph, outputs),
        workflowId,
        runId,
      };
      const result = await tasks.triggerAndWait<typeof cropImageTask>(
        "nextflow-crop-image",
        inputs,
      );

      if (!result.ok) {
        throw new Error(getTaskErrorMessage(result.error));
      }

      outputs.set(outputKey(node.id, "outputImage"), result.output.outputImageUrl);
      updateGraphNodeOutput(graph, node, result.output);

      const finishedAt = new Date();

      return {
        nodeId: node.id,
        nodeLabel,
        nodeType: node.type,
        status: "success",
        inputs,
        output: result.output,
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
      };
    }

    if (node.type === "gemini") {
      const inputs = {
        ...resolveGeminiInputs(node, graph, outputs),
        workflowId,
        runId,
      };
      const result = await tasks.triggerAndWait<typeof geminiTask>(
        "nextflow-gemini",
        inputs,
      );

      if (!result.ok) {
        throw new Error(getTaskErrorMessage(result.error));
      }

      outputs.set(outputKey(node.id, "response"), result.output.responseText);
      updateGraphNodeOutput(graph, node, result.output);

      const finishedAt = new Date();

      return {
        nodeId: node.id,
        nodeLabel,
        nodeType: node.type,
        status: "success",
        inputs,
        output: result.output,
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
      };
    }

    throw new Error("Node is not executable.");
  } catch (error) {
    const finishedAt = new Date();

    return {
      nodeId: node.id,
      nodeLabel,
      nodeType: node.type,
      status: "failed",
      error: error instanceof Error ? error.message : "Node execution failed.",
      startedAt,
      finishedAt,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
    };
  }
}

function nodeResultToPrismaStatus(status: ExecutionNodeResult["status"]) {
  if (status === "success") {
    return NodeRunStatus.SUCCESS;
  }

  if (status === "skipped") {
    return NodeRunStatus.SKIPPED;
  }

  return NodeRunStatus.FAILED;
}

function getTaskErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Trigger.dev task failed.";
}

function runStatusFromNodeResults(results: ExecutionNodeResult[]) {
  if (results.some((result) => result.status === "failed")) {
    return RunStatus.FAILED;
  }

  if (results.some((result) => result.status === "skipped")) {
    return RunStatus.PARTIAL;
  }

  return RunStatus.SUCCESS;
}

async function executeWorkflowGraph(
  workflowId: string,
  runId: string,
  graph: WorkflowGraph,
  input: RunWorkflowRequest,
) {
  const executableNodeIds = getExecutionNodeSet(graph, input);
  const outputs: NodeOutputMap = new Map();
  const completedNodeIds = new Set<string>();
  const startedNodeIds = new Set<string>();
  const running = new Map<string, Promise<ExecutionNodeResult>>();
  const results: ExecutionNodeResult[] = [];

  seedRequestInputOutputs(graph, outputs);

  while (completedNodeIds.size < executableNodeIds.size) {
    const readyNodes = graph.nodes.filter(
      (node) =>
        executableNodeIds.has(node.id) &&
        !startedNodeIds.has(node.id) &&
        executableDependenciesReady(
          node,
          graph,
          executableNodeIds,
          completedNodeIds,
        ),
    );

    for (const node of readyNodes) {
      startedNodeIds.add(node.id);
      running.set(
        node.id,
        executeNode(workflowId, runId, node, graph, outputs),
      );
    }

    if (running.size === 0) {
      break;
    }

    const completed = await Promise.race(
      Array.from(running.entries()).map(async ([nodeId, promise]) => ({
        nodeId,
        result: await promise,
      })),
    );

    running.delete(completed.nodeId);
    completedNodeIds.add(completed.nodeId);
    results.push(completed.result);
  }

  resolveLocalResponseNodes(graph, outputs);

  return results;
}

export async function runWorkflow(
  clerkUserId: string,
  workflowId: WorkflowNodeId,
  input: RunWorkflowRequest,
) {
  const prisma = getPrismaClient();
  const startedAt = new Date();

  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      clerkUserId,
    },
  });

  if (!workflow) {
    return null;
  }

  const graph = workflowGraphSchema.parse(workflow.graph);
  const run = await prisma.workflowRun.create({
    data: {
      workflowId,
      clerkUserId,
      scope: toRunScope(input.scope),
      status: RunStatus.PARTIAL,
    },
  });

  await prisma.workflow.update({
    where: {
      id: workflow.id,
    },
    data: {
      status: WorkflowStatus.RUNNING,
    },
  });

  const nodeResults = await executeWorkflowGraph(workflowId, run.id, graph, input);
  const finishedAt = new Date();
  const status = runStatusFromNodeResults(nodeResults);

  const [updatedRun, updatedWorkflow] = await prisma.$transaction([
    prisma.workflowRun.update({
      where: {
        id: run.id,
      },
      data: {
        status,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        nodeRuns: {
          create: nodeResults.map((nodeResult) => ({
            nodeId: nodeResult.nodeId,
            nodeLabel: nodeResult.nodeLabel,
            nodeType: nodeResult.nodeType,
            status: nodeResultToPrismaStatus(nodeResult.status),
            inputs: nodeResult.inputs as Prisma.InputJsonValue,
            output: nodeResult.output as Prisma.InputJsonValue,
            error: nodeResult.error,
            startedAt: nodeResult.startedAt,
            finishedAt: nodeResult.finishedAt,
            durationMs: nodeResult.durationMs,
          })),
        },
      },
      include: {
        nodeRuns: {
          orderBy: {
            startedAt: "asc",
          },
        },
      },
    }),
    prisma.workflow.update({
      where: {
        id: workflow.id,
      },
      data: {
        graph: graph as unknown as Prisma.InputJsonValue,
        status: WorkflowStatus.IDLE,
      },
    }),
  ]);

  return {
    run: mapWorkflowRun(updatedRun),
    workflow: mapWorkflowToDetail(updatedWorkflow),
  };
}

export async function listWorkflowRuns(
  clerkUserId: string,
  workflowId: string,
) {
  const prisma = getPrismaClient();
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      clerkUserId,
    },
    select: {
      id: true,
    },
  });

  if (!workflow) {
    return null;
  }

  const runs = await prisma.workflowRun.findMany({
    where: {
      workflowId,
      clerkUserId,
    },
    orderBy: {
      startedAt: "desc",
    },
    include: {
      nodeRuns: {
        orderBy: {
          startedAt: "asc",
        },
      },
    },
  });

  return runs.map(mapWorkflowRun);
}
