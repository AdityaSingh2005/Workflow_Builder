import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  createApiErrorResponse,
  createValidationErrorResponse,
  getErrorMessage,
} from "@/lib/api/errors";
import { parseJsonRequest } from "@/lib/api/json";
import { getCurrentClerkUserId } from "@/lib/auth/clerk";
import { createWorkflowSchema } from "@/lib/validation/workflow-api-schemas";
import {
  createWorkflow,
  listWorkflowSummaries,
} from "@/lib/workflows/workflow-service";

export async function GET() {
  const clerkUserId = await getCurrentClerkUserId();

  if (!clerkUserId) {
    return createApiErrorResponse(
      "UNAUTHORIZED",
      "Authentication is required.",
      401,
    );
  }

  try {
    const workflows = await listWorkflowSummaries(clerkUserId);

    return NextResponse.json({ workflows });
  } catch (error) {
    return createApiErrorResponse(
      "INTERNAL_SERVER_ERROR",
      getErrorMessage(error),
      500,
    );
  }
}

export async function POST(request: Request) {
  const clerkUserId = await getCurrentClerkUserId();

  if (!clerkUserId) {
    return createApiErrorResponse(
      "UNAUTHORIZED",
      "Authentication is required.",
      401,
    );
  }

  try {
    const input = await parseJsonRequest(request, createWorkflowSchema);
    const workflow = await createWorkflow(clerkUserId, input.name);

    return NextResponse.json({ workflow }, { status: 201 });
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

