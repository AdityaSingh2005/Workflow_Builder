import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  createApiErrorResponse,
  createValidationErrorResponse,
  getErrorMessage,
} from "@/lib/api/errors";
import { parseJsonRequest } from "@/lib/api/json";
import { getCurrentClerkUserId } from "@/lib/auth/clerk";
import { updateWorkflowSchema } from "@/lib/validation/workflow-api-schemas";
import {
  deleteWorkflow,
  getWorkflowForUser,
  updateWorkflow,
} from "@/lib/workflows/workflow-service";

type WorkflowRouteContext = {
  params: Promise<{
    workflowId: string;
  }>;
};

export async function GET(_request: Request, context: WorkflowRouteContext) {
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
    const workflow = await getWorkflowForUser(clerkUserId, workflowId);

    if (!workflow) {
      return createApiErrorResponse("NOT_FOUND", "Workflow not found.", 404);
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    return createApiErrorResponse(
      "INTERNAL_SERVER_ERROR",
      getErrorMessage(error),
      500,
    );
  }
}

export async function PATCH(request: Request, context: WorkflowRouteContext) {
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
    const input = await parseJsonRequest(request, updateWorkflowSchema);
    const workflow = await updateWorkflow(clerkUserId, workflowId, input);

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

export async function DELETE(_request: Request, context: WorkflowRouteContext) {
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
    const deleted = await deleteWorkflow(clerkUserId, workflowId);

    if (!deleted) {
      return createApiErrorResponse("NOT_FOUND", "Workflow not found.", 404);
    }

    return NextResponse.json({ workflowId });
  } catch (error) {
    return createApiErrorResponse(
      "INTERNAL_SERVER_ERROR",
      getErrorMessage(error),
      500,
    );
  }
}

