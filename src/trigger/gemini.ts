import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { task } from "@trigger.dev/sdk/v3";

import {
  geminiTaskInputSchema,
  geminiTaskOutputSchema,
  type GeminiTaskInput,
  type GeminiTaskOutput,
} from "@/lib/validation/execution-schemas";

function getMimeTypeFromUrl(url: string) {
  if (url.endsWith(".png")) {
    return "image/png";
  }

  if (url.endsWith(".webp")) {
    return "image/webp";
  }

  if (url.endsWith(".gif")) {
    return "image/gif";
  }

  return "image/jpeg";
}

async function createImagePart(url: string): Promise<Part> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to download Gemini vision image.");
  }

  const bytes = Buffer.from(await response.arrayBuffer());

  return {
    inlineData: {
      data: bytes.toString("base64"),
      mimeType: response.headers.get("content-type") ?? getMimeTypeFromUrl(url),
    },
  };
}

export const geminiTask = task({
  id: "nextflow-gemini",
  maxDuration: 300,
  run: async (payload: GeminiTaskInput): Promise<GeminiTaskOutput> => {
    const input = geminiTaskInputSchema.parse(payload);
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      throw new Error("Google Gemini API key is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: input.modelId,
      systemInstruction: input.systemPrompt,
    });
    const imageParts = await Promise.all(input.imageUrls.map(createImagePart));
    const result = await model.generateContent([input.prompt, ...imageParts]);
    const response = result.response;

    return geminiTaskOutputSchema.parse({
      responseText: response.text(),
      usage: response.usageMetadata
        ? {
            inputTokens: response.usageMetadata.promptTokenCount,
            outputTokens: response.usageMetadata.candidatesTokenCount,
            totalTokens: response.usageMetadata.totalTokenCount,
          }
        : undefined,
    });
  },
});
