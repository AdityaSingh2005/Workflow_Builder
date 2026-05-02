import type { Connection, Edge, Node } from "@xyflow/react";

import {
  areHandleDataTypesCompatible,
  getSourceHandleDataType,
  getTargetHandleRule,
} from "@/lib/graph/handle-definitions";
import type {
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
  WorkflowNodeData,
} from "@/types/workflow";

export type WorkflowFlowNode = Node<WorkflowNodeData, string>;
export type WorkflowFlowEdge = Edge<{
  dataType?: WorkflowEdge["dataType"];
}>;

export function createWorkflowEdgeId(connection: Connection) {
  return [
    "edge",
    connection.source,
    connection.sourceHandle,
    connection.target,
    connection.targetHandle,
  ]
    .filter(Boolean)
    .join(":");
}

export function flowNodeToWorkflowNode(node: WorkflowFlowNode): WorkflowNode {
  return {
    id: node.id,
    type: node.type as WorkflowNode["type"],
    position: node.position,
    locked: node.deletable === false,
    data: node.data,
  };
}

export function workflowNodeToFlowNode(node: WorkflowNode): WorkflowFlowNode {
  return {
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
    deletable: !node.locked,
    selectable: true,
  };
}

export function workflowEdgeToFlowEdge(edge: WorkflowEdge): WorkflowFlowEdge {
  return {
    id: edge.id,
    source: edge.source,
    sourceHandle: edge.sourceHandle,
    target: edge.target,
    targetHandle: edge.targetHandle,
    animated: true,
    type: "smoothstep",
    style: {
      stroke: "var(--color-primary)",
      strokeWidth: 2,
    },
    data: {
      dataType: edge.dataType,
    },
  };
}

export function flowEdgeToWorkflowEdge(edge: WorkflowFlowEdge): WorkflowEdge {
  return {
    id: edge.id,
    source: edge.source,
    sourceHandle: edge.sourceHandle ?? "",
    target: edge.target,
    targetHandle: edge.targetHandle ?? "",
    dataType: edge.data?.dataType ?? "any",
  };
}

export function workflowGraphToFlow(graph: WorkflowGraph) {
  return {
    nodes: graph.nodes.map(workflowNodeToFlowNode),
    edges: graph.edges.map(workflowEdgeToFlowEdge),
  };
}

export function flowToWorkflowGraph(
  nodes: WorkflowFlowNode[],
  edges: WorkflowFlowEdge[],
  schemaVersion: WorkflowGraph["schemaVersion"],
): WorkflowGraph {
  return {
    schemaVersion,
    nodes: nodes.map(flowNodeToWorkflowNode),
    edges: edges.map(flowEdgeToWorkflowEdge),
  };
}

function wouldCreateCycle(
  connection: Connection,
  edges: WorkflowFlowEdge[],
): boolean {
  if (!connection.source || !connection.target) {
    return true;
  }

  const adjacency = new Map<string, string[]>();

  for (const edge of edges) {
    const targets = adjacency.get(edge.source) ?? [];
    targets.push(edge.target);
    adjacency.set(edge.source, targets);
  }

  const nextTargets = adjacency.get(connection.source) ?? [];
  nextTargets.push(connection.target);
  adjacency.set(connection.source, nextTargets);

  const visited = new Set<string>();
  const stack = [connection.target];

  while (stack.length > 0) {
    const currentNodeId = stack.pop();

    if (!currentNodeId) {
      continue;
    }

    if (currentNodeId === connection.source) {
      return true;
    }

    if (visited.has(currentNodeId)) {
      continue;
    }

    visited.add(currentNodeId);
    stack.push(...(adjacency.get(currentNodeId) ?? []));
  }

  return false;
}

export function canConnectWorkflowHandles(
  connection: Connection,
  nodes: WorkflowFlowNode[],
  edges: WorkflowFlowEdge[],
) {
  if (
    !connection.source ||
    !connection.target ||
    !connection.sourceHandle ||
    !connection.targetHandle ||
    connection.source === connection.target
  ) {
    return false;
  }

  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);

  if (!sourceNode || !targetNode) {
    return false;
  }

  const sourceDataType = getSourceHandleDataType(
    flowNodeToWorkflowNode(sourceNode),
    connection.sourceHandle,
  );
  const targetRule = getTargetHandleRule(
    targetNode.type as WorkflowNode["type"],
    connection.targetHandle,
  );

  if (!sourceDataType || !targetRule) {
    return false;
  }

  const targetAlreadyConnected = edges.some(
    (edge) =>
      edge.target === connection.target &&
      edge.targetHandle === connection.targetHandle,
  );

  if (targetAlreadyConnected && !targetRule.allowMultiple) {
    return false;
  }

  if (!areHandleDataTypesCompatible(sourceDataType, targetRule.dataType)) {
    return false;
  }

  return !wouldCreateCycle(connection, edges);
}

export function getConnectionDataType(
  connection: Connection,
  nodes: WorkflowFlowNode[],
) {
  if (!connection.source || !connection.sourceHandle) {
    return undefined;
  }

  const sourceNode = nodes.find((node) => node.id === connection.source);

  if (!sourceNode) {
    return undefined;
  }

  return getSourceHandleDataType(
    flowNodeToWorkflowNode(sourceNode),
    connection.sourceHandle,
  );
}

export function getConnectedTargetHandles(
  nodeId: string,
  edges: WorkflowFlowEdge[],
) {
  return new Set(
    edges
      .filter((edge) => edge.target === nodeId && edge.targetHandle)
      .map((edge) => edge.targetHandle as string),
  );
}
