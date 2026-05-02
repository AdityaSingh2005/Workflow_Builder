export type WorkflowId = string;
export type WorkflowRunId = string;
export type WorkflowNodeId = string;
export type WorkflowEdgeId = string;
export type WorkflowHandleId = string;
export type RequestInputFieldId = string;

export type WorkflowNodeType =
  | "requestInputs"
  | "cropImage"
  | "gemini"
  | "response";

export type WorkflowHandleDataType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "any";

export type WorkflowHandleDirection = "source" | "target";

export type WorkflowRunScope = "full" | "partial" | "single";
export type WorkflowRunStatus = "success" | "failed" | "partial";
export type NodeExecutionStatus =
  | "idle"
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "skipped";

export type WorkflowPosition = {
  x: number;
  y: number;
};

export type WorkflowHandleDefinition = {
  id: WorkflowHandleId;
  label: string;
  dataType: WorkflowHandleDataType;
  direction: WorkflowHandleDirection;
  required?: boolean;
  allowMultiple?: boolean;
};

export type NodeTypeDefinition = {
  type: WorkflowNodeType;
  label: string;
  executable: boolean;
  locked: boolean;
};

export type RequestInputFieldType = "text_field" | "image_field";

export type RequestInputField = {
  id: RequestInputFieldId;
  name: string;
  type: RequestInputFieldType;
  value: string;
  previewUrl?: string;
};

export type RequestInputsNodeData = {
  label: "Request-Inputs";
  fields: RequestInputField[];
};

export type CropImageNodeData = {
  label: string;
  inputImageUrl?: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  outputImageUrl?: string;
};

export type GeminiNodeData = {
  label: string;
  modelLabel: string;
  modelId?: string;
  prompt?: string;
  systemPrompt?: string;
  imageUrls: string[];
  videoUrls: string[];
  audioUrls: string[];
  fileUrls: string[];
  settingsCollapsed: boolean;
  responseText?: string;
};

export type ResponseNodeData = {
  label: "Response";
  result?: string;
};

export type WorkflowNodeData =
  | RequestInputsNodeData
  | CropImageNodeData
  | GeminiNodeData
  | ResponseNodeData;

export type WorkflowNode<TData extends WorkflowNodeData = WorkflowNodeData> = {
  id: WorkflowNodeId;
  type: WorkflowNodeType;
  position: WorkflowPosition;
  data: TData;
  locked?: boolean;
};

export type WorkflowEdge = {
  id: WorkflowEdgeId;
  source: WorkflowNodeId;
  sourceHandle: WorkflowHandleId;
  target: WorkflowNodeId;
  targetHandle: WorkflowHandleId;
  dataType: WorkflowHandleDataType;
};

export type WorkflowGraph = {
  schemaVersion: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
};

export type WorkflowSummary = {
  id: WorkflowId;
  name: string;
  status: "idle" | "running";
  updatedAt: string;
};

export type WorkflowDetail = WorkflowSummary & {
  graph: WorkflowGraph;
  createdAt: string;
};

export type NodeExecutionResult = {
  nodeId: WorkflowNodeId;
  nodeLabel: string;
  nodeType: WorkflowNodeType;
  status: NodeExecutionStatus;
  inputs?: unknown;
  output?: unknown;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
};

export type WorkflowRun = {
  id: WorkflowRunId;
  workflowId: WorkflowId;
  scope: WorkflowRunScope;
  status: WorkflowRunStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  nodeRuns: NodeExecutionResult[];
};

export type RunWorkflowRequest = {
  scope: WorkflowRunScope;
  nodeIds?: WorkflowNodeId[];
};

export type RunWorkflowResponse = {
  run: WorkflowRun;
  workflow: WorkflowDetail;
};
