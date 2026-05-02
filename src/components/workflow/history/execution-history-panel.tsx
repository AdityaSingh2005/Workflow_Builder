"use client";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type ExecutionHistoryPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function ExecutionHistoryPanel({
  open,
  onClose,
}: ExecutionHistoryPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <aside className="absolute right-0 top-0 z-20 flex h-full w-[340px] flex-col border-l border-border-primary bg-layer-1">
      <div className="flex h-16 items-center justify-between px-4">
        <h2 className="text-base font-semibold text-text-primary">
          Execution History
        </h2>
        <Button aria-label="Close history" onClick={onClose} size="icon" variant="ghost">
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-2 rounded-control bg-layer-2 p-1">
          <button
            className="h-8 rounded-md bg-layer-1 text-xs font-semibold text-text-primary shadow-sm"
            type="button"
          >
            UI Runs
          </button>
          <button
            className="h-8 rounded-md text-xs font-semibold text-text-tertiary"
            type="button"
          >
            API Runs
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-5">
        <span className="text-sm font-semibold text-text-secondary">
          Run history
        </span>
        <Badge>All</Badge>
      </div>

      <div className="px-4">
        <Panel className="grid min-h-24 place-items-center px-4 py-6 text-center text-sm text-text-tertiary shadow-none">
          No runs for this filter yet.
        </Panel>
      </div>
    </aside>
  );
}

