export const GEMINI_MODEL_OPTIONS = [
  {
    label: "Gemini 3.1 Pro",
    modelId: "gemini-2.5-pro",
  },
  {
    label: "Gemini 2.5 Pro",
    modelId: "gemini-2.5-pro",
  },
  {
    label: "Gemini 1.5 Pro",
    modelId: "gemini-1.5-pro",
  },
] as const;

export function resolveGeminiModelId(modelLabel: string, modelId?: string) {
  if (modelId) {
    return modelId;
  }

  return (
    GEMINI_MODEL_OPTIONS.find((option) => option.label === modelLabel)
      ?.modelId ?? GEMINI_MODEL_OPTIONS[0].modelId
  );
}

