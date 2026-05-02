import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  createApiErrorResponse,
  createValidationErrorResponse,
  getErrorMessage,
} from "@/lib/api/errors";
import { parseJsonRequest } from "@/lib/api/json";
import { getCurrentClerkUserId } from "@/lib/auth/clerk";
import { importWorkflowSchema } from "@/lib/validation/workflow-api-schemas";
import { saveWorkflowGraph } from "@/lib/workflows/workflow-service";

type ImportRouteContext = {
  params: Promise<{
    workflowId: string;
  }>;
};

export async function POST(request: Request, context: ImportRouteContext) {
  const clerkUserId = await getCurrentClerkUserId();

  if (!clerkUserId) {
    return createApiErrorResponse(
      "UNAUTHORIZED",
      "Authentication is required.",
      401,
    );
  }

  const { workflowId } = await context.params;

  try {
    const input = await parseJsonRequest(request, importWorkflowSchema);
    const workflow = await saveWorkflowGraph(
      clerkUserId,
      workflowId,
      input.graph,
    );

    if (!workflow) {
      return createApiErrorResponse("NOT_FOUND", "Workflow not found.", 404);
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }

    return createApiErrorResponse(
      "INTERNAL_SERVER_ERROR",
      getErrorMessage(error),
      500,
    );
  }
}

