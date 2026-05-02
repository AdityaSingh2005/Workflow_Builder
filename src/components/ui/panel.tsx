import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-panel border border-border-primary bg-layer-1 shadow-panel",
        className,
      )}
      {...props}
    />
  );
}

