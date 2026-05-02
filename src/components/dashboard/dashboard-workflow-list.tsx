"use client";

import { MoreHorizontal, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
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
  const [isCreatingSample, setIsCreatingSample] = useState(false);
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

  async function createSampleMarketingWorkflow() {
    setIsCreatingSample(true);
    setErrorMessage(undefined);

    try {
      const response = await fetch("/api/workflows/sample", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to create sample workflow.");
      }

      const payload = (await response.json()) as CreateWorkflowResponse;
      router.push(`/workflows/${payload.workflow.id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create sample workflow.",
      );
    } finally {
      setIsCreatingSample(false);
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
          <p className="text-sm font-medium text-text-secondary">Workflows</p>
          <h1 className="text-2xl font-semibold tracking-normal text-text-primary">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={isCreatingSample}
            onClick={createSampleMarketingWorkflow}
            variant="secondary"
          >
            <Sparkles aria-hidden="true" className="size-4 text-primary" />
            {isCreatingSample ? "Creating" : "Sample Workflow"}
          </Button>
          <Button
            disabled={isCreating}
            onClick={createNewWorkflow}
            variant="primary"
          >
            <Plus aria-hidden="true" className="size-4" />
            {isCreating ? "Creating" : "Create New Workflow"}
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-panel border border-[#f1c5c5] bg-[#fff7f7] px-4 py-3 text-sm text-danger">
          {errorMessage}
        </div>
      ) : null}

      <Panel className="overflow-hidden shadow-sm">
        {workflows.length === 0 ? (
          <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
            <div className="max-w-sm">
              <div className="mx-auto grid size-10 place-items-center rounded-panel border border-border-primary bg-layer-2">
                <Plus aria-hidden="true" className="size-5 text-primary" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-text-primary">
                No workflows yet
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Create your first workflow to open a blank canvas with
                Request-Inputs and Response already placed.
              </p>
              <Button
                className="mt-5"
                disabled={isCreating}
                onClick={createNewWorkflow}
                variant="primary"
              >
                <Plus aria-hidden="true" className="size-4" />
                Create New Workflow
              </Button>
              <Button
                className="mt-3"
                disabled={isCreatingSample}
                onClick={createSampleMarketingWorkflow}
                variant="secondary"
              >
                <Sparkles aria-hidden="true" className="size-4 text-primary" />
                {isCreatingSample ? "Creating" : "Open Sample Workflow"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border-secondary">
            <div className="grid grid-cols-[minmax(0,1fr)_160px_120px_190px] gap-4 bg-layer-2 px-5 py-3 text-xs font-semibold uppercase tracking-normal text-text-secondary">
              <span>Name</span>
              <span>Last Edited</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {workflows.map((workflow) => {
              const isPending = pendingWorkflowId === workflow.id;

              return (
                <div
                  className="grid grid-cols-[minmax(0,1fr)_160px_120px_190px] items-center gap-4 px-5 py-4 transition hover:bg-layer-2"
                  key={workflow.id}
                >
                  <div className="min-w-0">
                    <Link
                      className="block truncate text-sm font-semibold text-text-primary hover:text-primary"
                      href={`/workflows/${workflow.id}`}
                    >
                      {workflow.name}
                    </Link>
                    <p className="mt-1 truncate text-xs text-text-tertiary">
                      {workflow.id}
                    </p>
                  </div>

                  <span className="text-sm text-text-secondary">
                    {formatLastEdited(workflow.updatedAt)}
                  </span>

                  <Badge
                    tone={workflow.status === "running" ? "warning" : "success"}
                  >
                    {workflow.status === "running" ? "Running" : "Idle"}
                  </Badge>

                  <div className="flex items-center justify-end gap-2">
                    <Link
                      className="rounded-control border border-border-primary px-3 py-1.5 text-sm font-medium text-text-primary transition hover:bg-layer-2"
                      href={`/workflows/${workflow.id}`}
                    >
                      Open
                    </Link>
                    <Button
                      aria-label={`Rename ${workflow.name}`}
                      disabled={isPending}
                      onClick={() => void renameExistingWorkflow(workflow)}
                      size="icon"
                      variant="secondary"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      aria-label={`Delete ${workflow.name}`}
                      disabled={isPending}
                      onClick={() => void deleteExistingWorkflow(workflow)}
                      size="icon"
                      variant="danger"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                    <MoreHorizontal
                      aria-hidden="true"
                      className="size-4 text-text-tertiary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </section>
  );
}
