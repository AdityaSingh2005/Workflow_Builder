"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import type { WorkflowDetail, WorkflowSummary } from "@/types/workflow";

type DashboardWorkflowListProps = {
  initialWorkflows: WorkflowSummary[];
  databaseError?: string;
};

type CreateWorkflowResponse = {
  workflow: WorkflowDetail;
};

type UpdateWorkflowResponse = {
  workflow: WorkflowDetail;
};

function formatLastEdited(updatedAt: string) {
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffMs = new Date(updatedAt).getTime() - Date.now();
  const absDiffMs = Math.abs(diffMs);
  const minuteMs = 60_000;
  const hourMs = minuteMs * 60;
  const dayMs = hourMs * 24;

  if (absDiffMs < hourMs) {
    return formatter.format(Math.round(diffMs / minuteMs), "minute");
  }

  if (absDiffMs < dayMs) {
    return formatter.format(Math.round(diffMs / hourMs), "hour");
  }

  return formatter.format(Math.round(diffMs / dayMs), "day");
}

export function DashboardWorkflowList({
  initialWorkflows,
  databaseError,
}: DashboardWorkflowListProps) {
  const router = useRouter();
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [pendingWorkflowId, setPendingWorkflowId] = useState<string>();
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(databaseError);

  async function createNewWorkflow() {
    setIsCreating(true);
    setErrorMessage(undefined);

    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Untitled Workflow" }),
      });

      if (!response.ok) {
        throw new Error("Unable to create workflow.");
      }

      const payload = (await response.json()) as CreateWorkflowResponse;
      router.push(`/workflows/${payload.workflow.id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create workflow.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function renameExistingWorkflow(workflow: WorkflowSummary) {
    const nextName = window.prompt("Rename workflow", workflow.name)?.trim();

    if (!nextName || nextName === workflow.name) {
      return;
    }

    setPendingWorkflowId(workflow.id);
    setErrorMessage(undefined);

    try {
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: nextName }),
      });

      if (!response.ok) {
        throw new Error("Unable to rename workflow.");
      }

      const payload = (await response.json()) as UpdateWorkflowResponse;
      setWorkflows((currentWorkflows) =>
        currentWorkflows.map((currentWorkflow) =>
          currentWorkflow.id === workflow.id
            ? {
                id: payload.workflow.id,
                name: payload.workflow.name,
                status: payload.workflow.status,
                updatedAt: payload.workflow.updatedAt,
              }
            : currentWorkflow,
        ),
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to rename workflow.",
      );
    } finally {
      setPendingWorkflowId(undefined);
    }
  }

  async function deleteExistingWorkflow(workflow: WorkflowSummary) {
    const confirmed = window.confirm(`Delete "${workflow.name}"?`);

    if (!confirmed) {
      return;
    }

    setPendingWorkflowId(workflow.id);
    setErrorMessage(undefined);

    try {
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete workflow.");
      }

      setWorkflows((currentWorkflows) =>
        currentWorkflows.filter(
          (currentWorkflow) => currentWorkflow.id !== workflow.id,
        ),
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete workflow.",
      );
    } finally {
      setPendingWorkflowId(undefined);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#737782]">Workflows</p>
          <h1 className="text-2xl font-semibold tracking-normal text-[#191b23]">
            Dashboard
          </h1>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-md bg-[#635bff] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#554df0] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isCreating}
          onClick={createNewWorkflow}
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" />
          {isCreating ? "Creating" : "Create New Workflow"}
        </button>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-[#f1c5c5] bg-[#fff7f7] px-4 py-3 text-sm text-[#9c2f2f]">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-[#e7e8ec] bg-white shadow-sm">
        {workflows.length === 0 ? (
          <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
            <div className="max-w-sm">
              <div className="mx-auto grid size-10 place-items-center rounded-lg border border-[#e7e8ec] bg-[#fbfbfc]">
                <Plus aria-hidden="true" className="size-5 text-[#635bff]" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-[#191b23]">
                No workflows yet
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#737782]">
                Create your first workflow to open a blank canvas with
                Request-Inputs and Response already placed.
              </p>
              <button
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#635bff] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#554df0] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCreating}
                onClick={createNewWorkflow}
                type="button"
              >
                <Plus aria-hidden="true" className="size-4" />
                Create New Workflow
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#eef0f4]">
            <div className="grid grid-cols-[minmax(0,1fr)_160px_120px_190px] gap-4 bg-[#fbfbfc] px-5 py-3 text-xs font-semibold uppercase tracking-normal text-[#737782]">
              <span>Name</span>
              <span>Last Edited</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {workflows.map((workflow) => {
              const isPending = pendingWorkflowId === workflow.id;

              return (
                <div
                  className="grid grid-cols-[minmax(0,1fr)_160px_120px_190px] items-center gap-4 px-5 py-4 transition hover:bg-[#fbfbfc]"
                  key={workflow.id}
                >
                  <div className="min-w-0">
                    <Link
                      className="block truncate text-sm font-semibold text-[#191b23] hover:text-[#635bff]"
                      href={`/workflows/${workflow.id}`}
                    >
                      {workflow.name}
                    </Link>
                    <p className="mt-1 truncate text-xs text-[#9b9faa]">
                      {workflow.id}
                    </p>
                  </div>

                  <span className="text-sm text-[#737782]">
                    {formatLastEdited(workflow.updatedAt)}
                  </span>

                  <span
                    className={cn(
                      "w-fit rounded-full px-2.5 py-1 text-xs font-semibold",
                      workflow.status === "running"
                        ? "bg-[#fff3d6] text-[#9a6300]"
                        : "bg-[#eefaf2] text-[#2b7a46]",
                    )}
                  >
                    {workflow.status === "running" ? "Running" : "Idle"}
                  </span>

                  <div className="flex items-center justify-end gap-2">
                    <Link
                      className="rounded-md border border-[#e7e8ec] px-3 py-1.5 text-sm font-medium text-[#343741] transition hover:bg-[#f5f6f8]"
                      href={`/workflows/${workflow.id}`}
                    >
                      Open
                    </Link>
                    <button
                      aria-label={`Rename ${workflow.name}`}
                      className="grid size-8 place-items-center rounded-md border border-[#e7e8ec] text-[#565b66] transition hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isPending}
                      onClick={() => void renameExistingWorkflow(workflow)}
                      type="button"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </button>
                    <button
                      aria-label={`Delete ${workflow.name}`}
                      className="grid size-8 place-items-center rounded-md border border-[#e7e8ec] text-[#b33a3a] transition hover:bg-[#fff7f7] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isPending}
                      onClick={() => void deleteExistingWorkflow(workflow)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                    <MoreHorizontal
                      aria-hidden="true"
                      className="size-4 text-[#b3b7c0]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
