import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

const toneClassNames: Record<BadgeTone, string> = {
  neutral: "bg-layer-2 text-text-secondary",
  success: "bg-[#eefaf2] text-success",
  warning: "bg-[#fff3d6] text-warning",
  danger: "bg-[#fff0f0] text-danger",
  primary: "bg-primary-soft text-primary",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClassNames[tone],
        className,
      )}
      {...props}
    />
  );
}

