"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import type { WorkflowRun } from "@/types/workflow";

type ExecutionHistoryPanelProps = {
  open: boolean;
  workflowId: string;
  refreshKey: number;
  onClose: () => void;
};

function formatRunDetailValue(value: unknown) {
  if (value === undefined || value === null) {
    return "n/a";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value).slice(0, 220);
}

export function ExecutionHistoryPanel({
  open,
  workflowId,
  refreshKey,
  onClose,
}: ExecutionHistoryPanelProps) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [expandedRunId, setExpandedRunId] = useState<string>();

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadRuns() {
      const response = await fetch(`/api/workflows/${workflowId}/runs`);

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { runs: WorkflowRun[] };

      if (!cancelled) {
        setRuns(payload.runs);
      }
    }

    void loadRuns();

    return () => {
      cancelled = true;
    };
  }, [open, refreshKey, workflowId]);

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

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {runs.length === 0 ? (
          <Panel className="grid min-h-24 place-items-center px-4 py-6 text-center text-sm text-text-tertiary shadow-none">
            No runs for this filter yet.
          </Panel>
        ) : (
          <div className="space-y-2">
            {runs.map((run, index) => {
              const expanded = expandedRunId === run.id;

              return (
                <Panel className="overflow-hidden shadow-none" key={run.id}>
                  <button
                    className="flex w-full items-center gap-3 px-3 py-3 text-left"
                    onClick={() =>
                      setExpandedRunId(expanded ? undefined : run.id)
                    }
                    type="button"
                  >
                    <ChevronDown
                      aria-hidden="true"
                      className={`size-4 text-text-tertiary transition ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-text-primary">
                        Run #{runs.length - index}
                      </span>
                      <span className="block truncate text-xs text-text-tertiary">
                        {new Date(run.startedAt).toLocaleString()} · {run.scope}
                      </span>
                    </span>
                    <Badge
                      tone={
                        run.status === "success"
                          ? "success"
                          : run.status === "partial"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {run.status}
                    </Badge>
                  </button>

                  {expanded ? (
                    <div className="border-t border-border-secondary px-3 py-2">
                      <div className="mb-2 text-xs text-text-tertiary">
                        Duration:{" "}
                        {run.durationMs
                          ? `${(run.durationMs / 1000).toFixed(1)}s`
                          : "n/a"}
                      </div>
                      <div className="space-y-2">
                        {run.nodeRuns.map((nodeRun) => (
                          <div
                            className="rounded-control bg-layer-2 px-2 py-2 text-xs"
                            key={`${run.id}-${nodeRun.nodeId}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate font-semibold text-text-primary">
                                {nodeRun.nodeLabel}
                              </span>
                              <Badge
                                tone={
                                  nodeRun.status === "success"
                                    ? "success"
                                    : nodeRun.status === "skipped"
                                      ? "warning"
                                      : "danger"
                                }
                              >
                                {nodeRun.status}
                              </Badge>
                            </div>
                            <div className="mt-1 text-text-tertiary">
                              {nodeRun.durationMs
                                ? `${(nodeRun.durationMs / 1000).toFixed(1)}s`
                                : "n/a"}
                              {nodeRun.error ? ` · ${nodeRun.error}` : ""}
                            </div>
                            <div className="mt-2 space-y-1 text-[11px] text-text-tertiary">
                              <div className="truncate">
                                Inputs: {formatRunDetailValue(nodeRun.inputs)}
                              </div>
                              <div className="truncate">
                                Output: {formatRunDetailValue(nodeRun.output)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </Panel>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
