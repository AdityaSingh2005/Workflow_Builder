import { redirect } from "next/navigation";

import { DashboardWorkflowList } from "@/components/dashboard/dashboard-workflow-list";
import { getCurrentClerkUserId } from "@/lib/auth/clerk";
import { getErrorMessage } from "@/lib/api/errors";
import { listWorkflowSummaries } from "@/lib/workflows/workflow-service";
import type { WorkflowSummary } from "@/types/workflow";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const clerkUserId = await getCurrentClerkUserId();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  let workflows: WorkflowSummary[] = [];
  let databaseError: string | undefined;

  try {
    workflows = await listWorkflowSummaries(clerkUserId);
  } catch (error) {
    databaseError = `Database is not ready: ${getErrorMessage(error)}`;
  }

  return (
    <DashboardWorkflowList
      databaseError={databaseError}
      initialWorkflows={workflows}
    />
  );
}
