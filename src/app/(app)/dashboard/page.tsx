export default function DashboardPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#737782]">Workflows</p>
          <h1 className="text-2xl font-semibold tracking-normal text-[#191b23]">
            Dashboard
          </h1>
        </div>
        <button className="rounded-md bg-[#635bff] px-4 py-2 text-sm font-semibold text-white shadow-sm">
          Create New Workflow
        </button>
      </div>

      <div className="rounded-lg border border-[#e7e8ec] bg-white p-8 shadow-sm">
        <p className="text-sm text-[#737782]">
          Workflow CRUD and user-scoped persistence are implemented in Phase 2.
        </p>
      </div>
    </section>
  );
}

