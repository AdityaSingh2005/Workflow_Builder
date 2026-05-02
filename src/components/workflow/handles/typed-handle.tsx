"use client";

import { Handle, Position, type HandleType } from "@xyflow/react";

import { cn } from "@/lib/utils/cn";
import type { WorkflowHandleDataType } from "@/types/workflow";

const handleColorClassNames: Record<WorkflowHandleDataType, string> = {
  text: "bg-handle-text",
  image: "bg-handle-image",
  video: "bg-[#8c5cff]",
  audio: "bg-[#f35da8]",
  file: "bg-[#5c6574]",
  any: "bg-handle-any",
};

type TypedHandleProps = {
  id: string;
  type: HandleType;
  position: Position;
  dataType: WorkflowHandleDataType;
  className?: string;
};

export function TypedHandle({
  id,
  type,
  position,
  dataType,
  className,
}: TypedHandleProps) {
  return (
    <Handle
      className={cn(
        "!size-3 !border-2 !border-layer-1",
        handleColorClassNames[dataType],
        className,
      )}
      id={id}
      position={position}
      type={type}
    />
  );
}

