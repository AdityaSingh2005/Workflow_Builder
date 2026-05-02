import { NextResponse } from "next/server";

import { createApiErrorResponse, getErrorMessage } from "@/lib/api/errors";
import { getCurrentClerkUserId } from "@/lib/auth/clerk";
import { createSampleWorkflow } from "@/lib/workflows/workflow-service";

export async function POST() {
  const clerkUserId = await getCurrentClerkUserId();

  if (!clerkUserId) {
    return createApiErrorResponse(
      "UNAUTHORIZED",
      "Authentication is required.",
      401,
    );
  }

  try {
    const workflow = await createSampleWorkflow(clerkUserId);

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    return createApiErrorResponse(
      "INTERNAL_SERVER_ERROR",
      getErrorMessage(error),
      500,
    );
  }
}

