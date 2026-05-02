import { NextResponse } from "next/server";

import { WORKFLOW_GRAPH_SCHEMA_VERSION } from "@/config/workflow";
import { createApiErrorResponse, getErrorMessage } from "@/lib/api/errors";
import { getCurrentClerkUserId } from "@/lib/auth/clerk";
import { getWorkflowForUser } from "@/lib/workflows/workflow-service";

type ExportRouteContext = {
  params: Promise<{
    workflowId: string;
  }>;
};

function createExportFilename(workflowName: string) {
  const slug = workflowName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "workflow"}-nextflow.json`;
}

export async function GET(_request: Request, context: ExportRouteContext) {
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

    return NextResponse.json(
      {
        application: "NextFlow",
        schemaVersion: WORKFLOW_GRAPH_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        name: workflow.name,
        graph: workflow.graph,
      },
      {
        headers: {
          "Content-Disposition": `attachment; filename="${createExportFilename(
            workflow.name,
          )}"`,
        },
      },
    );
  } catch (error) {
    return createApiErrorResponse(
      "INTERNAL_SERVER_ERROR",
      getErrorMessage(error),
      500,
    );
  }
}

