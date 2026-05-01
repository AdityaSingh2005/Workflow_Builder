# Google Gemini LLM Rules

## Purpose

Use Google Gemini through `@google/generative-ai` for all LLM execution, including multimodal vision inputs.

## Rules

- Gemini calls must run only inside Trigger.dev tasks.
- The client may configure Gemini node inputs, but must never call Gemini directly.
- Default display model label is `Gemini 3.1 Pro` to match the assignment.
- Keep a model-label-to-provider-id mapping in one config file.
- Validate the actual provider model id during implementation against the available Gemini API models.
- Support text prompt and system prompt.
- Support multiple images on the Image Vision input handle.
- Store text output in the Gemini node response section.
- Keep provider errors user-readable in history while avoiding secret leakage.
- Record request shape, resolved inputs, output text, timing, and errors in node run history.

## Input Contract

```ts
type GeminiTaskInput = {
  workflowId: string;
  runId: string;
  nodeId: string;
  modelLabel: "Gemini 3.1 Pro" | string;
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  audioUrls?: string[];
  fileUrls?: string[];
  settings?: Record<string, unknown>;
};
```

## Output Contract

```ts
type GeminiTaskOutput = {
  responseText: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
};
```

## Required Env Vars

```text
GOOGLE_GENERATIVE_AI_API_KEY=
```

## Implementation Checklist

- Prompt is required before execution.
- System prompt is optional.
- Image Vision accepts multiple typed image connections.
- Manual prompt field is disabled when Prompt handle is connected.
- Node displays latest response inline.
- History records output text and execution duration.

