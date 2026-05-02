import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-20 w-full resize-none rounded-control border border-border-primary bg-layer-2 px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-primary focus:bg-layer-1 disabled:cursor-not-allowed disabled:bg-layer-2 disabled:text-text-tertiary",
        className,
      )}
      {...props}
    />
  );
}

