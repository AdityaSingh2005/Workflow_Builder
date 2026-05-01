import { UserButton } from "@clerk/nextjs";
import { Workflow } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <header className="flex h-14 items-center justify-between border-b border-[#e7e8ec] bg-white px-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#191b23]">
          <span className="grid size-8 place-items-center rounded-md border border-[#e7e8ec] bg-white">
            <Workflow aria-hidden="true" className="size-4" />
          </span>
          NextFlow
        </div>
        <UserButton />
      </header>
      {children}
    </div>
  );
}

