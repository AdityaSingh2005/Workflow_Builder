"use client";

import { Calculator, Clock3, History, Play, Undo2, Redo2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { useWorkflowBuilderStore } from "@/store/workflow-builder-store";

type WorkflowTopbarProps = {
  workflowName: string;
  onToggleHistory: () => void;
};

export function WorkflowTopbar({
  workflowName,
  onToggleHistory,
}: WorkflowTopbarProps) {
  const undo = useWorkflowBuilderStore((state) => state.undo);
  const redo = useWorkflowBuilderStore((state) => state.redo);
  const canUndo = useWorkflowBuilderStore((state) => state.undoStack.length > 0);
  const canRedo = useWorkflowBuilderStore((state) => state.redoStack.length > 0);

  return (
    <div className="pointer-events-none absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-4">
      <Panel className="pointer-events-auto flex h-11 items-center gap-2 px-2 shadow-floating">
        <Link
          aria-label="Back to dashboard"
          className="grid size-8 place-items-center rounded-control text-sm font-semibold text-text-secondary transition hover:bg-layer-2 hover:text-text-primary"
          href="/dashboard"
        >
          ←
        </Link>
        <span className="max-w-[260px] truncate pr-3 text-sm font-semibold text-text-primary">
          {workflowName}
        </span>
      </Panel>

      <div className="pointer-events-auto flex items-center gap-2">
        <Panel className="flex h-9 items-center gap-2 px-3 text-xs font-semibold text-text-secondary shadow-sm">
          <Calculator aria-hidden="true" className="size-4" />
          Est&nbsp; 0.83 M
        </Panel>
        <Panel className="flex h-9 items-center gap-2 px-3 text-xs font-semibold text-text-secondary shadow-sm">
          Bal&nbsp; 0.00 M
        </Panel>
        <Button disabled={!canUndo} onClick={undo} size="icon" variant="secondary">
          <Undo2 aria-hidden="true" className="size-4" />
        </Button>
        <Button disabled={!canRedo} onClick={redo} size="icon" variant="secondary">
          <Redo2 aria-hidden="true" className="size-4" />
        </Button>
        <Button size="iconLg" variant="primary">
          <Play aria-hidden="true" className="size-5 fill-white" />
        </Button>
        <Button onClick={onToggleHistory} size="iconLg" variant="secondary">
          <History aria-hidden="true" className="size-5" />
        </Button>
        <Button size="iconLg" variant="secondary">
          <Clock3 aria-hidden="true" className="size-5" />
        </Button>
      </div>
    </div>
  );
}
