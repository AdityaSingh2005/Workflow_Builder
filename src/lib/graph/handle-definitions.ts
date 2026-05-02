import type {
  RequestInputsNodeData,
  RequestInputFieldType,
  WorkflowHandleDataType,
  WorkflowNode,
  WorkflowNodeType,
} from "@/types/workflow";

type TargetHandleRule = {
  dataType: WorkflowHandleDataType;
  allowMultiple: boolean;
};

const targetHandleRules: Partial<
  Record<WorkflowNodeType, Record<string, TargetHandleRule>>
> = {
  cropImage: {
    inputImage: {
      dataType: "image",
      allowMultiple: false,
    },
  },
  gemini: {
    prompt: {
      dataType: "text",
      allowMultiple: false,
    },
    systemPrompt: {
      dataType: "text",
      allowMultiple: false,
    },
    image: {
      dataType: "image",
      allowMultiple: true,
    },
    video: {
      dataType: "video",
      allowMultiple: true,
    },
    audio: {
      dataType: "audio",
      allowMultiple: true,
    },
    file: {
      dataType: "file",
      allowMultiple: true,
    },
  },
  response: {
    result: {
      dataType: "text",
      allowMultiple: false,
    },
  },
};

function getFieldDataType(fieldType: RequestInputFieldType) {
  return fieldType === "image_field" ? "image" : "text";
}

export function getSourceHandleDataType(
  node: WorkflowNode,
  handleId?: string | null,
): WorkflowHandleDataType | undefined {
  if (!handleId) {
    return undefined;
  }

  if (node.type === "requestInputs" && handleId.startsWith("field:")) {
    const fieldId = handleId.replace("field:", "");
    const data = node.data as RequestInputsNodeData;
    const field = data.fields.find(
      (requestField) => requestField.id === fieldId,
    );

    return field ? getFieldDataType(field.type) : undefined;
  }

  if (node.type === "cropImage" && handleId === "outputImage") {
    return "image";
  }

  if (node.type === "gemini" && handleId === "response") {
    return "text";
  }

  return undefined;
}

export function getTargetHandleRule(
  nodeType: WorkflowNodeType,
  handleId?: string | null,
) {
  if (!handleId) {
    return undefined;
  }

  return targetHandleRules[nodeType]?.[handleId];
}

export function areHandleDataTypesCompatible(
  sourceDataType: WorkflowHandleDataType,
  targetDataType: WorkflowHandleDataType,
) {
  return (
    sourceDataType === targetDataType ||
    sourceDataType === "any" ||
    targetDataType === "any"
  );
}
