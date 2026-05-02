import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Input({
  className,
  type = "text",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-control border border-border-primary bg-layer-2 px-3 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-primary focus:bg-layer-1 disabled:cursor-not-allowed disabled:bg-layer-2 disabled:text-text-tertiary",
        className,
      )}
      type={type}
      {...props}
    />
  );
}

