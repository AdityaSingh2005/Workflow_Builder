import { notFound, redirect } from "next/navigation";

import { WorkflowCanvas } from "@/components/workflow/canvas/workflow-canvas";
import { getCurrentClerkUserId } from "@/lib/auth/clerk";
import { getWorkflowForUser } from "@/lib/workflows/workflow-service";

type WorkflowCanvasPageProps = {
  params: Promise<{
    workflowId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function WorkflowCanvasPage({
  params,
}: WorkflowCanvasPageProps) {
  const { workflowId } = await params;
  const clerkUserId = await getCurrentClerkUserId();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  const workflow = await getWorkflowForUser(clerkUserId, workflowId);

  if (!workflow) {
    notFound();
  }

  return <WorkflowCanvas workflow={workflow} />;
}
