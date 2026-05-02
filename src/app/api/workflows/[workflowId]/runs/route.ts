import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  createApiErrorResponse,
  createValidationErrorResponse,
  getErrorMessage,
} from "@/lib/api/errors";
import { parseJsonRequest } from "@/lib/api/json";
import { getCurrentClerkUserId } from "@/lib/auth/clerk";
import {
  listWorkflowRuns,
  runWorkflow,
} from "@/lib/execution/workflow-run-service";
import { runWorkflowRequestSchema } from "@/lib/validation/execution-schemas";

type RunsRouteContext = {
  params: Promise<{
    workflowId: string;
  }>;
};

export async function GET(_request: Request, context: RunsRouteContext) {
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
    const runs = await listWorkflowRuns(clerkUserId, workflowId);

    if (!runs) {
      return createApiErrorResponse("NOT_FOUND", "Workflow not found.", 404);
    }

    return NextResponse.json({ runs });
  } catch (error) {
    return createApiErrorResponse(
      "INTERNAL_SERVER_ERROR",
      getErrorMessage(error),
      500,
    );
  }
}

export async function POST(request: Request, context: RunsRouteContext) {
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
    const input = await parseJsonRequest(request, runWorkflowRequestSchema);
    const result = await runWorkflow(clerkUserId, workflowId, input);

    if (!result) {
      return createApiErrorResponse("NOT_FOUND", "Workflow not found.", 404);
    }

    return NextResponse.json(result, { status: 201 });
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

