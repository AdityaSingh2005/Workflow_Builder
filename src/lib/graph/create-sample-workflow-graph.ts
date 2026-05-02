import { WORKFLOW_GRAPH_SCHEMA_VERSION } from "@/config/workflow";
import type { WorkflowGraph } from "@/types/workflow";

const SAMPLE_PRODUCT_IMAGE_URL =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80";

export function createSampleWorkflowGraph(): WorkflowGraph {
  return {
    schemaVersion: WORKFLOW_GRAPH_SCHEMA_VERSION,
    nodes: [
      {
        id: "request-inputs",
        type: "requestInputs",
        position: {
          x: 80,
          y: 300,
        },
        locked: true,
        data: {
          label: "Request-Inputs",
          fields: [
            {
              id: "sample-text-field",
              name: "text_field",
              type: "text_field",
              value:
                "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.",
            },
            {
              id: "sample-image-field",
              name: "image_field",
              type: "image_field",
              value: SAMPLE_PRODUCT_IMAGE_URL,
              previewUrl: SAMPLE_PRODUCT_IMAGE_URL,
            },
          ],
        },
      },
      {
        id: "crop-tight-product",
        type: "cropImage",
        position: {
          x: 440,
          y: 100,
        },
        data: {
          label: "Crop Image #1",
          xPercent: 20,
          yPercent: 20,
          widthPercent: 60,
          heightPercent: 60,
        },
      },
      {
        id: "crop-wide-banner",
        type: "cropImage",
        position: {
          x: 440,
          y: 390,
        },
        data: {
          label: "Crop Image #2",
          xPercent: 0,
          yPercent: 0,
          widthPercent: 100,
          heightPercent: 50,
        },
      },
      {
        id: "gemini-product-description",
        type: "gemini",
        position: {
          x: 440,
          y: 680,
        },
        data: {
          label: "Gemini 3.1 Pro #1",
          modelLabel: "Gemini 3.1 Pro",
          systemPrompt:
            "You are a marketing copywriter. Write a one-paragraph product description.",
          imageUrls: [],
          videoUrls: [],
          audioUrls: [],
          fileUrls: [],
          settingsCollapsed: true,
        },
      },
      {
        id: "gemini-tweet-hook",
        type: "gemini",
        position: {
          x: 820,
          y: 680,
        },
        data: {
          label: "Gemini 3.1 Pro #2",
          modelLabel: "Gemini 3.1 Pro",
          systemPrompt:
            "Condense the following product description into a tweet-length hook (under 240 characters).",
          imageUrls: [],
          videoUrls: [],
          audioUrls: [],
          fileUrls: [],
          settingsCollapsed: true,
        },
      },
      {
        id: "gemini-final-post",
        type: "gemini",
        position: {
          x: 1200,
          y: 350,
        },
        data: {
          label: "Gemini 3.1 Pro #3 (Final)",
          modelLabel: "Gemini 3.1 Pro",
          systemPrompt:
            "You are a social media manager. Combine the tweet hook and the two product crops into a final marketing post.",
          imageUrls: [],
          videoUrls: [],
          audioUrls: [],
          fileUrls: [],
          settingsCollapsed: true,
        },
      },
      {
        id: "response",
        type: "response",
        position: {
          x: 1580,
          y: 390,
        },
        locked: true,
        data: {
          label: "Response",
        },
      },
    ],
    edges: [
      {
        id: "edge:request-inputs:field:sample-image-field:crop-tight-product:inputImage",
        source: "request-inputs",
        sourceHandle: "field:sample-image-field",
        target: "crop-tight-product",
        targetHandle: "inputImage",
        dataType: "image",
      },
      {
        id: "edge:request-inputs:field:sample-image-field:crop-wide-banner:inputImage",
        source: "request-inputs",
        sourceHandle: "field:sample-image-field",
        target: "crop-wide-banner",
        targetHandle: "inputImage",
        dataType: "image",
      },
      {
        id: "edge:request-inputs:field:sample-text-field:gemini-product-description:prompt",
        source: "request-inputs",
        sourceHandle: "field:sample-text-field",
        target: "gemini-product-description",
        targetHandle: "prompt",
        dataType: "text",
      },
      {
        id: "edge:gemini-product-description:response:gemini-tweet-hook:prompt",
        source: "gemini-product-description",
        sourceHandle: "response",
        target: "gemini-tweet-hook",
        targetHandle: "prompt",
        dataType: "text",
      },
      {
        id: "edge:crop-tight-product:outputImage:gemini-final-post:image",
        source: "crop-tight-product",
        sourceHandle: "outputImage",
        target: "gemini-final-post",
        targetHandle: "image",
        dataType: "image",
      },
      {
        id: "edge:crop-wide-banner:outputImage:gemini-final-post:image",
        source: "crop-wide-banner",
        sourceHandle: "outputImage",
        target: "gemini-final-post",
        targetHandle: "image",
        dataType: "image",
      },
      {
        id: "edge:gemini-tweet-hook:response:gemini-final-post:prompt",
        source: "gemini-tweet-hook",
        sourceHandle: "response",
        target: "gemini-final-post",
        targetHandle: "prompt",
        dataType: "text",
      },
      {
        id: "edge:gemini-final-post:response:response:result",
        source: "gemini-final-post",
        sourceHandle: "response",
        target: "response",
        targetHandle: "result",
        dataType: "text",
      },
    ],
    viewport: {
      x: 0,
      y: 0,
      zoom: 0.75,
    },
  };
}

