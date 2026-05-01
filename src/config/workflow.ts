import type { NodeTypeDefinition } from "@/types/workflow";

export const WORKFLOW_GRAPH_SCHEMA_VERSION = 1;

export const LOCKED_NODE_TYPES = ["requestInputs", "response"] as const;

export const NODE_TYPE_DEFINITIONS: Record<string, NodeTypeDefinition> = {
  requestInputs: {
    type: "requestInputs",
    label: "Request-Inputs",
    executable: false,
    locked: true,
  },
  cropImage: {
    type: "cropImage",
    label: "Crop Image",
    executable: true,
    locked: false,
  },
  gemini: {
    type: "gemini",
    label: "Gemini 3.1 Pro",
    executable: true,
    locked: false,
  },
  response: {
    type: "response",
    label: "Response",
    executable: false,
    locked: true,
  },
};

export const GEMINI_MODEL_LABEL = "Gemini 3.1 Pro";

