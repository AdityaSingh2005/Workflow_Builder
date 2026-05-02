"use client";

import { MoreHorizontal, Play } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useWorkflowBuilderStore } from "@/store/workflow-builder-store";

type NodeShellProps = {
  title: string;
  nodeId: string;
  children: ReactNode;
  selected?: boolean;
  locked?: boolean;
  running?: boolean;
  icon?: ReactNode;
  className?: string;
};

export function NodeShell({
  title,
  nodeId,
  children,
  selected,
  locked,
  running,
  icon,
  className,
}: NodeShellProps) {
  const deleteWorkflowNodes = useWorkflowBuilderStore(
    (state) => state.deleteWorkflowNodes,
  );

  return (
    <div
      className={cn(
        "w-[270px] overflow-hidden rounded-panel border bg-layer-1 shadow-node transition",
        selected ? "border-primary" : "border-border-primary",
        running ? "nextflow-running-node" : undefined,
        className,
      )}
    >
      <div className="flex h-10 items-center justify-between border-b border-border-secondary px-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon ? <span className="shrink-0 text-primary">{icon}</span> : null}
          <span className="truncate text-xs font-semibold text-text-primary">
            {title}
          </span>
          {locked ? (
            <span className="rounded-full bg-layer-2 px-1.5 py-0.5 text-[10px] font-semibold text-text-tertiary">
              locked
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {!locked ? (
            <Button
              className="h-6 px-2 text-[10px]"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("nextflow:run-nodes", {
                    detail: {
                      scope: "single",
                      nodeIds: [nodeId],
                    },
                  }),
                )
              }
              size="sm"
              variant="ghost"
            >
              <Play aria-hidden="true" className="size-3 text-success" />
              Run
            </Button>
          ) : null}
          <Button
            aria-label={locked ? `${title} menu` : `Delete ${title}`}
            onClick={
              locked ? undefined : () => deleteWorkflowNodes([nodeId])
            }
            size="icon"
            title={locked ? `${title} menu` : `Delete ${title}`}
            variant="ghost"
          >
            <MoreHorizontal aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
