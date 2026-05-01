type WorkflowCanvasPageProps = {
  params: Promise<{
    workflowId: string;
  }>;
};

export default async function WorkflowCanvasPage({
  params,
}: WorkflowCanvasPageProps) {
  const { workflowId } = await params;

  return (
    <section className="flex min-h-[calc(100vh-57px)] w-full flex-col bg-[#fbfbfc]">
      <div className="border-b border-[#e7e8ec] bg-white px-6 py-4">
        <p className="text-sm font-medium text-[#737782]">Workflow Canvas</p>
        <h1 className="text-xl font-semibold tracking-normal text-[#191b23]">
          {workflowId}
        </h1>
      </div>
      <div className="grid flex-1 place-items-center bg-[radial-gradient(#d8dbe2_1px,transparent_1px)] [background-size:18px_18px]">
        <div className="rounded-lg border border-[#e7e8ec] bg-white px-6 py-4 text-sm text-[#737782] shadow-sm">
          React Flow canvas foundation lands in Phase 4.
        </div>
      </div>
    </section>
  );
}

