import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-sm hover:bg-primary-hover active:bg-primary-hover",
        secondary:
          "border border-border-primary bg-layer-1 text-text-primary shadow-sm hover:bg-layer-2",
        ghost: "text-text-secondary hover:bg-layer-2 hover:text-text-primary",
        danger:
          "border border-border-primary bg-layer-1 text-danger hover:bg-[#fff7f7]",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
        icon: "size-8 p-0",
        iconLg: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      type={type}
      {...props}
    />
  );
}

