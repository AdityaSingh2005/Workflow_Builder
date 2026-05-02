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
  WorkflowGraph,
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
      set((state) => ({
        nodes: applyNodeChanges(changes, state.nodes),
      }));
    },
    applyWorkflowEdgeChanges: (changes) => {
      const shouldCaptureUndo = changes.some(
        (change) => change.type === "remove",
      );

      set((state) => ({
        ...(shouldCaptureUndo ? pushUndoSnapshot(state) : {}),
        edges: applyEdgeChanges(changes, state.edges),
      }));
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
      set({
        selectedNodeIds: nodeIds,
        selectedEdgeIds: edgeIds,
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
