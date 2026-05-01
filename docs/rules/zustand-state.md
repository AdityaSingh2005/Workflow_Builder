# Zustand State Rules

## Purpose

Use Zustand for client-side workflow builder state, canvas interactions, undo/redo, selection, and transient execution UI.

## Rules

- Keep persisted source of truth in PostgreSQL.
- Keep client graph editing state in Zustand.
- Do not store API secrets or provider credentials in Zustand.
- Separate durable graph state from transient UI state.
- Store undo and redo stacks for meaningful graph changes only.
- Avoid placing large binary data in store; use URLs for uploaded media.
- Use selectors to prevent unnecessary rerenders.
- Keep React Flow changes and domain graph changes synchronized through typed actions.

## Suggested Store Slices

```ts
type WorkflowGraphSlice = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  applyNodeChanges: (changes: NodeChange[]) => void;
  applyEdgeChanges: (changes: EdgeChange[]) => void;
  addWorkflowNode: (node: WorkflowNode) => void;
  deleteWorkflowNodes: (nodeIds: string[]) => void;
  connectWorkflowHandles: (connection: TypedConnection) => void;
};

type ExecutionSlice = {
  activeRunId?: string;
  runningNodeIds: string[];
  latestNodeOutputs: Record<string, unknown>;
  setNodeRunning: (nodeId: string, running: boolean) => void;
};

type HistorySlice = {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};
```

## Implementation Checklist

- Actions have descriptive names.
- Undo captures graph changes, node config changes, and edge changes.
- Running state drives pulsating glow.
- Selection state drives single and multi-select runs.
- Store can hydrate from server workflow graph.
- Store can serialize to workflow export JSON.

