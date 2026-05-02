"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
  type OnConnect,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ExecutionHistoryPanel } from "@/components/workflow/history/execution-history-panel";
import { CropImageNode } from "@/components/workflow/nodes/crop-image-node";
import { GeminiNode } from "@/components/workflow/nodes/gemini-node";
import { RequestInputsNode } from "@/components/workflow/nodes/request-inputs-node";
import { ResponseNode } from "@/components/workflow/nodes/response-node";
import { NodePicker } from "@/components/workflow/picker/node-picker";
import { WorkflowSidebar } from "@/components/workflow/sidebar/workflow-sidebar";
import { WorkflowBottomToolbar } from "@/components/workflow/toolbar/workflow-bottom-toolbar";
import { WorkflowTopbar } from "@/components/workflow/topbar/workflow-topbar";
import { cn } from "@/lib/utils/cn";
import { useWorkflowBuilderStore } from "@/store/workflow-builder-store";
import type { WorkflowDetail, WorkflowGraph } from "@/types/workflow";

const nodeTypes = {
  requestInputs: RequestInputsNode,
  cropImage: CropImageNode,
  gemini: GeminiNode,
  response: ResponseNode,
} satisfies NodeTypes;

type WorkflowCanvasProps = {
  workflow: WorkflowDetail;
};

function normalizeWorkflowGraphForAutosave(graph: WorkflowGraph) {
  return {
    schemaVersion: graph.schemaVersion,
    nodes: graph.nodes,
    edges: graph.edges,
  };
}

export function WorkflowCanvas({ workflow }: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner workflow={workflow} />
    </ReactFlowProvider>
  );
}

function WorkflowCanvasInner({ workflow }: WorkflowCanvasProps) {
  const reactFlow = useReactFlow();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const hasHydratedRef = useRef(false);
  const lastSerializedGraphRef = useRef<string | undefined>(undefined);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const nodes = useWorkflowBuilderStore((state) => state.nodes);
  const edges = useWorkflowBuilderStore((state) => state.edges);
  const hydrateWorkflow = useWorkflowBuilderStore((state) => state.hydrateWorkflow);
  const applyWorkflowNodeChanges = useWorkflowBuilderStore(
    (state) => state.applyWorkflowNodeChanges,
  );
  const applyWorkflowEdgeChanges = useWorkflowBuilderStore(
    (state) => state.applyWorkflowEdgeChanges,
  );
  const canConnectHandles = useWorkflowBuilderStore(
    (state) => state.canConnectHandles,
  );
  const connectWorkflowHandles = useWorkflowBuilderStore(
    (state) => state.connectWorkflowHandles,
  );
  const addCropImageNode = useWorkflowBuilderStore(
    (state) => state.addCropImageNode,
  );
  const addGeminiNode = useWorkflowBuilderStore((state) => state.addGeminiNode);
  const deleteSelectedGraphItems = useWorkflowBuilderStore(
    (state) => state.deleteSelectedGraphItems,
  );
  const captureGraphSnapshot = useWorkflowBuilderStore(
    (state) => state.captureGraphSnapshot,
  );
  const setSelection = useWorkflowBuilderStore((state) => state.setSelection);
  const serializeWorkflowGraph = useWorkflowBuilderStore(
    (state) => state.serializeWorkflowGraph,
  );

  useEffect(() => {
    hydrateWorkflow({
      workflowId: workflow.id,
      workflowName: workflow.name,
      graph: workflow.graph,
    });
    lastSerializedGraphRef.current = JSON.stringify(
      normalizeWorkflowGraphForAutosave(workflow.graph),
    );
    hasHydratedRef.current = true;
  }, [hydrateWorkflow, workflow.graph, workflow.id, workflow.name]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (isTyping) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelectedGraphItems();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedGraphItems]);

  useEffect(() => {
    if (!hasHydratedRef.current || nodes.length === 0) {
      return;
    }

    const graph = serializeWorkflowGraph();
    const serializedGraph = JSON.stringify(graph);

    if (serializedGraph === lastSerializedGraphRef.current) {
      return;
    }

    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      lastSerializedGraphRef.current = serializedGraph;
      void fetch(`/api/workflows/${workflow.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          graph,
        }),
      });
    }, 900);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [edges, nodes, serializeWorkflowGraph, workflow.id]);

  const onConnect = useCallback<OnConnect>(
    (connection) => {
      connectWorkflowHandles(connection);
    },
    [connectWorkflowHandles],
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "var(--color-primary)",
        strokeWidth: 2,
      },
    }),
    [],
  );

  function getPickerInsertPosition() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    return reactFlow.screenToFlowPosition({
      x: viewportWidth / 2,
      y: viewportHeight / 2,
    });
  }

  function addCropFromPicker() {
    addCropImageNode(getPickerInsertPosition());
    setPickerOpen(false);
  }

  function addGeminiFromPicker() {
    addGeminiNode(getPickerInsertPosition());
    setPickerOpen(false);
  }

  return (
    <div className="flex h-[calc(100vh-57px)] min-h-[680px] overflow-hidden bg-layer-0">
      <WorkflowSidebar />

      <main className="relative min-w-0 flex-1 overflow-hidden">
        <ReactFlow
          className={cn("bg-layer-0")}
          connectionLineStyle={{
            stroke: "var(--color-primary)",
            strokeWidth: 2,
          }}
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultEdgeOptions={defaultEdgeOptions}
          deleteKeyCode={null}
          edges={edges}
          fitView
          isValidConnection={(connection) =>
            canConnectHandles({
              source: connection.source,
              sourceHandle: connection.sourceHandle ?? null,
              target: connection.target,
              targetHandle: connection.targetHandle ?? null,
            })
          }
          nodeTypes={nodeTypes}
          nodes={nodes}
          onConnect={onConnect}
          onEdgesChange={applyWorkflowEdgeChanges}
          onNodeDragStart={captureGraphSnapshot}
          onNodesChange={applyWorkflowNodeChanges}
          onSelectionChange={({ nodes: selectedNodes, edges: selectedEdges }) =>
            setSelection({
              nodeIds: selectedNodes.map((node) => node.id),
              edgeIds: selectedEdges.map((edge) => edge.id),
            })
          }
          panOnScroll
          selectionOnDrag
        >
          <Background
            color="#d8dbe2"
            gap={18}
            size={1}
            variant={BackgroundVariant.Dots}
          />
          <Controls
            className="!bottom-5 !left-auto !right-5 !top-auto !rounded-panel !border !border-border-primary !bg-layer-1 !shadow-floating"
            position="bottom-right"
            showInteractive={false}
          />
          <MiniMap
            className="!bottom-20 !right-5"
            maskColor="rgba(99, 91, 255, 0.08)"
            nodeColor="var(--color-primary-soft)"
            pannable
            position="bottom-right"
            zoomable
          />
        </ReactFlow>

        <WorkflowTopbar
          onToggleHistory={() => setHistoryOpen((current) => !current)}
          workflowName={workflow.name}
        />
        <WorkflowBottomToolbar
          onTogglePicker={() => setPickerOpen((current) => !current)}
          pickerOpen={pickerOpen}
        />
        <NodePicker
          onAddCropImage={addCropFromPicker}
          onAddGemini={addGeminiFromPicker}
          open={pickerOpen}
        />
        <ExecutionHistoryPanel
          onClose={() => setHistoryOpen(false)}
          open={historyOpen}
        />
      </main>
    </div>
  );
}
