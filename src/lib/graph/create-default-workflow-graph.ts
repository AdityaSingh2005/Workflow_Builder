import { WORKFLOW_GRAPH_SCHEMA_VERSION } from "@/config/workflow";
import type { WorkflowGraph } from "@/types/workflow";

export function createDefaultWorkflowGraph(): WorkflowGraph {
  return {
    schemaVersion: WORKFLOW_GRAPH_SCHEMA_VERSION,
    nodes: [
      {
        id: "request-inputs",
        type: "requestInputs",
        position: {
          x: 120,
          y: 220,
        },
        locked: true,
        data: {
          label: "Request-Inputs",
          fields: [],
        },
      },
      {
        id: "response",
        type: "response",
        position: {
          x: 760,
          y: 220,
        },
        locked: true,
        data: {
          label: "Response",
        },
      },
    ],
    edges: [],
    viewport: {
      x: 0,
      y: 0,
      zoom: 1,
    },
  };
}

