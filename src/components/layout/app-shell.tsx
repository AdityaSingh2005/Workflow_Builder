import { UserButton } from "@clerk/nextjs";
import { Workflow } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-layer-0">
      <header className="flex h-14 items-center justify-between border-b border-border-primary bg-layer-1 px-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <span className="grid size-8 place-items-center rounded-control border border-border-primary bg-layer-1">
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
