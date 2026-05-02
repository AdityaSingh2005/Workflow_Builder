"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type NodeRowProps = {
  label: string;
  children?: ReactNode;
  connected?: boolean;
  required?: boolean;
  className?: string;
};

export function NodeRow({
  label,
  children,
  connected,
  required,
  className,
}: NodeRowProps) {
  return (
    <div className={cn("relative flex flex-col gap-1.5 px-3 py-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium text-text-secondary">
          {label}
          {required ? <span className="text-handle-text">*</span> : null}
        </span>
        {connected ? (
          <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            connected
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

