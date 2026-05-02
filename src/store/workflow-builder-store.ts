"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { create } from "zustand";

import { WORKFLOW_GRAPH_SCHEMA_VERSION } from "@/config/workflow";
import {
  canConnectWorkflowHandles,
  createWorkflowEdgeId,
  flowToWorkflowGraph,
  getConnectionDataType,
  workflowGraphToFlow,
  type WorkflowFlowEdge,
  type WorkflowFlowNode,
} from "@/lib/graph/workflow-graph-validation";
import type {
  CropImageNodeData,
  GeminiNodeData,
  RequestInputFieldType,
  RequestInputsNodeData,
  WorkflowGraph,
  WorkflowNodeData,
} from "@/types/workflow";

type WorkflowSnapshot = {
  nodes: WorkflowFlowNode[];
  edges: WorkflowFlowEdge[];
};

type WorkflowBuilderState = {
  workflowId?: string;
  workflowName?: string;
  nodes: WorkflowFlowNode[];
  edges: WorkflowFlowEdge[];
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  runningNodeIds: string[];
  latestRunError?: string;
  undoStack: WorkflowSnapshot[];
  redoStack: WorkflowSnapshot[];
  hydrateWorkflow: (input: {
    workflowId: string;
    workflowName: string;
    graph: WorkflowGraph;
  }) => void;
  applyWorkflowNodeChanges: (changes: NodeChange<WorkflowFlowNode>[]) => void;
  applyWorkflowEdgeChanges: (changes: EdgeChange<WorkflowFlowEdge>[]) => void;
  addCropImageNode: (position: { x: number; y: number }) => void;
  addGeminiNode: (position: { x: number; y: number }) => void;
  connectWorkflowHandles: (connection: Connection) => boolean;
  canConnectHandles: (connection: Connection) => boolean;
  captureGraphSnapshot: () => void;
  deleteWorkflowNodes: (nodeIds: string[]) => void;
  deleteSelectedGraphItems: () => void;
  setSelection: (input: { nodeIds: string[]; edgeIds: string[] }) => void;
  setNodeRunning: (nodeId: string, running: boolean) => void;
  setRunningNodeIds: (nodeIds: string[]) => void;
  setLatestRunError: (message?: string) => void;
  addRequestInputField: (nodeId: string, fieldType: RequestInputFieldType) => void;
  updateRequestInputField: (
    nodeId: string,
    fieldId: string,
    updates: { name?: string; value?: string; previewUrl?: string },
  ) => void;
  updateCropImageNode: (
    nodeId: string,
    updates: Partial<CropImageNodeData>,
  ) => void;
  updateGeminiNode: (nodeId: string, updates: Partial<GeminiNodeData>) => void;
  updateWorkflowGraphFromServer: (graph: WorkflowGraph) => void;
  undo: () => void;
  redo: () => void;
  serializeWorkflowGraph: () => WorkflowGraph;
};

function createSnapshot(state: WorkflowBuilderState): WorkflowSnapshot {
  return {
    nodes: state.nodes,
    edges: state.edges,
  };
}

function pushUndoSnapshot(state: WorkflowBuilderState) {
  return {
    undoStack: [...state.undoStack, createSnapshot(state)].slice(-40),
    redoStack: [],
  };
}

function createNodeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function areStringArraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function areWorkflowFlowNodesEqual(
  left: WorkflowFlowNode[],
  right: WorkflowFlowNode[],
) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((leftNode, index) => {
    const rightNode = right[index];

    return (
      rightNode &&
      leftNode.id === rightNode.id &&
      leftNode.type === rightNode.type &&
      leftNode.position.x === rightNode.position.x &&
      leftNode.position.y === rightNode.position.y &&
      leftNode.selected === rightNode.selected &&
      leftNode.dragging === rightNode.dragging &&
      leftNode.resizing === rightNode.resizing &&
      leftNode.width === rightNode.width &&
      leftNode.height === rightNode.height &&
      leftNode.measured?.width === rightNode.measured?.width &&
      leftNode.measured?.height === rightNode.measured?.height &&
      leftNode.data === rightNode.data
    );
  });
}

function areWorkflowFlowEdgesEqual(
  left: WorkflowFlowEdge[],
  right: WorkflowFlowEdge[],
) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((leftEdge, index) => {
    const rightEdge = right[index];

    return (
      rightEdge &&
      leftEdge.id === rightEdge.id &&
      leftEdge.source === rightEdge.source &&
      leftEdge.target === rightEdge.target &&
      leftEdge.sourceHandle === rightEdge.sourceHandle &&
      leftEdge.targetHandle === rightEdge.targetHandle &&
      leftEdge.selected === rightEdge.selected &&
      leftEdge.data === rightEdge.data
    );
  });
}

function updateNodeData<TData extends WorkflowNodeData>(
  nodes: WorkflowFlowNode[],
  nodeId: string,
  updater: (data: TData) => TData,
) {
  return nodes.map((node) =>
    node.id === nodeId
      ? {
          ...node,
          data: updater(node.data as TData),
        }
      : node,
  );
}

function createRequestInputFieldName(
  existingFields: RequestInputsNodeData["fields"],
  fieldType: RequestInputFieldType,
) {
  const baseName = fieldType;
  const matchingCount = existingFields.filter((field) =>
    field.name.startsWith(baseName),
  ).length;

  return matchingCount === 0 ? baseName : `${baseName}_${matchingCount + 1}`;
}

function createCropImageNode(position: { x: number; y: number }) {
  const data: CropImageNodeData = {
    label: "Crop Image",
    xPercent: 0,
    yPercent: 0,
    widthPercent: 100,
    heightPercent: 100,
  };

  return {
    id: createNodeId("crop"),
    type: "cropImage",
    position,
    data,
    deletable: true,
  } satisfies WorkflowFlowNode;
}

function createGeminiNode(position: { x: number; y: number }) {
  const data: GeminiNodeData = {
    label: "Gemini 3.1 Pro",
    modelLabel: "Gemini 3.1 Pro",
    imageUrls: [],
    videoUrls: [],
    audioUrls: [],
    fileUrls: [],
    settingsCollapsed: true,
  };

  return {
    id: createNodeId("gemini"),
    type: "gemini",
    position,
    data,
    deletable: true,
  } satisfies WorkflowFlowNode;
}

export const useWorkflowBuilderStore = create<WorkflowBuilderState>(
  (set, get) => ({
    nodes: [],
    edges: [],
    selectedNodeIds: [],
    selectedEdgeIds: [],
    runningNodeIds: [],
    undoStack: [],
    redoStack: [],
    hydrateWorkflow: ({ workflowId, workflowName, graph }) => {
      const flow = workflowGraphToFlow(graph);

      set({
        workflowId,
        workflowName,
        nodes: flow.nodes,
        edges: flow.edges,
        selectedNodeIds: [],
        selectedEdgeIds: [],
        undoStack: [],
        redoStack: [],
      });
    },
    applyWorkflowNodeChanges: (changes) => {
      if (changes.length === 0) {
        return;
      }

      set((state) => {
        const nextNodes = applyNodeChanges(changes, state.nodes);

        if (areWorkflowFlowNodesEqual(state.nodes, nextNodes)) {
          return state;
        }

        return {
          nodes: nextNodes,
        };
      });
    },
    applyWorkflowEdgeChanges: (changes) => {
      if (changes.length === 0) {
        return;
      }

      const shouldCaptureUndo = changes.some(
        (change) => change.type === "remove",
      );

      set((state) => {
        const nextEdges = applyEdgeChanges(changes, state.edges);

        if (areWorkflowFlowEdgesEqual(state.edges, nextEdges)) {
          return state;
        }

        return {
          ...(shouldCaptureUndo ? pushUndoSnapshot(state) : {}),
          edges: nextEdges,
        };
      });
    },
    addCropImageNode: (position) => {
      set((state) => ({
        ...pushUndoSnapshot(state),
        nodes: [...state.nodes, createCropImageNode(position)],
      }));
    },
    addGeminiNode: (position) => {
      set((state) => ({
        ...pushUndoSnapshot(state),
        nodes: [...state.nodes, createGeminiNode(position)],
      }));
    },
    connectWorkflowHandles: (connection) => {
      const state = get();

      if (!canConnectWorkflowHandles(connection, state.nodes, state.edges)) {
        return false;
      }

      const sourceNode = state.nodes.find(
        (node) => node.id === connection.source,
      );
      const dataType = sourceNode
        ? getConnectionDataType(connection, state.nodes)
        : undefined;

      set((currentState) => {
        const edge: WorkflowFlowEdge = {
          id: createWorkflowEdgeId(connection),
          source: connection.source ?? "",
          sourceHandle: connection.sourceHandle,
          target: connection.target ?? "",
          targetHandle: connection.targetHandle,
          animated: true,
          type: "smoothstep",
          style: {
            stroke: "var(--color-primary)",
            strokeWidth: 2,
          },
          data: {
            dataType: dataType ?? "any",
          },
        };

        return {
          ...pushUndoSnapshot(currentState),
          edges: addEdge(edge, currentState.edges),
        };
      });

      return true;
    },
    canConnectHandles: (connection) =>
      canConnectWorkflowHandles(connection, get().nodes, get().edges),
    captureGraphSnapshot: () => {
      set((state) => ({
        ...pushUndoSnapshot(state),
      }));
    },
    deleteWorkflowNodes: (nodeIds) => {
      set((state) => {
        const nodeIdsToDelete = new Set(
          state.nodes
            .filter(
              (node) => nodeIds.includes(node.id) && node.deletable !== false,
            )
            .map((node) => node.id),
        );

        if (nodeIdsToDelete.size === 0) {
          return state;
        }

        return {
          ...pushUndoSnapshot(state),
          nodes: state.nodes.filter((node) => !nodeIdsToDelete.has(node.id)),
          edges: state.edges.filter(
            (edge) =>
              !nodeIdsToDelete.has(edge.source) &&
              !nodeIdsToDelete.has(edge.target),
          ),
          selectedNodeIds: state.selectedNodeIds.filter(
            (nodeId) => !nodeIdsToDelete.has(nodeId),
          ),
        };
      });
    },
    deleteSelectedGraphItems: () => {
      set((state) => {
        const deletableNodeIds = new Set(
          state.nodes
            .filter(
              (node) =>
                state.selectedNodeIds.includes(node.id) &&
                node.deletable !== false,
            )
            .map((node) => node.id),
        );
        const selectedEdgeIds = new Set(state.selectedEdgeIds);

        if (deletableNodeIds.size === 0 && selectedEdgeIds.size === 0) {
          return state;
        }

        return {
          ...pushUndoSnapshot(state),
          nodes: state.nodes.filter((node) => !deletableNodeIds.has(node.id)),
          edges: state.edges.filter(
            (edge) =>
              !selectedEdgeIds.has(edge.id) &&
              !deletableNodeIds.has(edge.source) &&
              !deletableNodeIds.has(edge.target),
          ),
          selectedNodeIds: [],
          selectedEdgeIds: [],
        };
      });
    },
    setSelection: ({ nodeIds, edgeIds }) => {
      set((state) => {
        if (
          areStringArraysEqual(state.selectedNodeIds, nodeIds) &&
          areStringArraysEqual(state.selectedEdgeIds, edgeIds)
        ) {
          return state;
        }

        return {
          selectedNodeIds: nodeIds,
          selectedEdgeIds: edgeIds,
        };
      });
    },
    setNodeRunning: (nodeId, running) => {
      set((state) => ({
        runningNodeIds: running
          ? Array.from(new Set([...state.runningNodeIds, nodeId]))
          : state.runningNodeIds.filter(
              (runningNodeId) => runningNodeId !== nodeId,
            ),
      }));
    },
    setRunningNodeIds: (nodeIds) => {
      set((state) => {
        const nextRunningNodeIds = Array.from(new Set(nodeIds));

        if (areStringArraysEqual(state.runningNodeIds, nextRunningNodeIds)) {
          return state;
        }

        return {
          runningNodeIds: nextRunningNodeIds,
        };
      });
    },
    setLatestRunError: (message) => {
      set((state) => {
        if (state.latestRunError === message) {
          return state;
        }

        return {
          latestRunError: message,
        };
      });
    },
    addRequestInputField: (nodeId, fieldType) => {
      set((state) => ({
        ...pushUndoSnapshot(state),
        nodes: updateNodeData<RequestInputsNodeData>(
          state.nodes,
          nodeId,
          (data) => ({
            ...data,
            fields: [
              ...data.fields,
              {
                id: crypto.randomUUID(),
                name: createRequestInputFieldName(data.fields, fieldType),
                type: fieldType,
                value: "",
              },
            ],
          }),
        ),
      }));
    },
    updateRequestInputField: (nodeId, fieldId, updates) => {
      set((state) => ({
        nodes: updateNodeData<RequestInputsNodeData>(
          state.nodes,
          nodeId,
          (data) => ({
            ...data,
            fields: data.fields.map((field) =>
              field.id === fieldId
                ? {
                    ...field,
                    ...updates,
                  }
                : field,
            ),
          }),
        ),
      }));
    },
    updateCropImageNode: (nodeId, updates) => {
      set((state) => ({
        nodes: updateNodeData<CropImageNodeData>(state.nodes, nodeId, (data) => ({
          ...data,
          ...updates,
        })),
      }));
    },
    updateGeminiNode: (nodeId, updates) => {
      set((state) => ({
        nodes: updateNodeData<GeminiNodeData>(state.nodes, nodeId, (data) => ({
          ...data,
          ...updates,
        })),
      }));
    },
    updateWorkflowGraphFromServer: (graph) => {
      const flow = workflowGraphToFlow(graph);

      set({
        nodes: flow.nodes,
        edges: flow.edges,
        runningNodeIds: [],
        latestRunError: undefined,
      });
    },
    undo: () => {
      set((state) => {
        const previousSnapshot = state.undoStack.at(-1);

        if (!previousSnapshot) {
          return state;
        }

        return {
          nodes: previousSnapshot.nodes,
          edges: previousSnapshot.edges,
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [...state.redoStack, createSnapshot(state)].slice(-40),
        };
      });
    },
    redo: () => {
      set((state) => {
        const nextSnapshot = state.redoStack.at(-1);

        if (!nextSnapshot) {
          return state;
        }

        return {
          nodes: nextSnapshot.nodes,
          edges: nextSnapshot.edges,
          redoStack: state.redoStack.slice(0, -1),
          undoStack: [...state.undoStack, createSnapshot(state)].slice(-40),
        };
      });
    },
    serializeWorkflowGraph: () =>
      flowToWorkflowGraph(
        get().nodes,
        get().edges,
        WORKFLOW_GRAPH_SCHEMA_VERSION,
      ),
  }),
);
