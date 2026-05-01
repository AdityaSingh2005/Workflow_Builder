import { notFound, redirect } from "next/navigation";

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

  return (
    <section className="flex min-h-[calc(100vh-57px)] w-full flex-col bg-[#fbfbfc]">
      <div className="border-b border-[#e7e8ec] bg-white px-6 py-4">
        <p className="text-sm font-medium text-[#737782]">Workflow Canvas</p>
        <h1 className="text-xl font-semibold tracking-normal text-[#191b23]">
          {workflow.name}
        </h1>
      </div>
      <div className="grid flex-1 place-items-center bg-[radial-gradient(#d8dbe2_1px,transparent_1px)] [background-size:18px_18px]">
        <div className="rounded-lg border border-[#e7e8ec] bg-white px-6 py-4 text-sm text-[#737782] shadow-sm">
          Blank graph ready with {workflow.graph.nodes.length} locked starter
          nodes. React Flow canvas foundation lands in Phase 4.
        </div>
      </div>
    </section>
  );
}
