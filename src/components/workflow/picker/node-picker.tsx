"use client";

import { Bot, Crop, ImageIcon, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils/cn";

type NodePickerProps = {
  open: boolean;
  onAddCropImage: () => void;
  onAddGemini: () => void;
};

const categories = ["Recent", "Image", "Video", "Audio", "Others"];

export function NodePicker({
  open,
  onAddCropImage,
  onAddGemini,
}: NodePickerProps) {
  if (!open) {
    return null;
  }

  return (
    <Panel className="absolute bottom-20 left-1/2 z-30 w-[420px] -translate-x-1/2 p-3 shadow-floating">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
        />
        <Input className="pl-9" placeholder="Search nodes..." />
      </div>

      <div className="mt-3 flex gap-1 overflow-x-auto">
        {categories.map((category, index) => (
          <button
            className={cn(
              "h-8 rounded-control px-3 text-xs font-semibold transition",
              index === 0
                ? "bg-primary-soft text-primary"
                : "text-text-tertiary hover:bg-layer-2 hover:text-text-primary",
            )}
            key={category}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2">
        <button
          className="flex items-center gap-3 rounded-control border border-border-primary bg-layer-1 px-3 py-3 text-left transition hover:bg-layer-2"
          onClick={onAddGemini}
          type="button"
        >
          <span className="grid size-9 place-items-center rounded-control bg-primary-soft text-primary">
            <Bot aria-hidden="true" className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-text-primary">
              Gemini 3.1 Pro
            </span>
            <span className="block truncate text-xs text-text-tertiary">
              LLM prompt, vision inputs, inline response
            </span>
          </span>
          <Sparkles aria-hidden="true" className="size-4 text-primary" />
        </button>

        <button
          className="flex items-center gap-3 rounded-control border border-border-primary bg-layer-1 px-3 py-3 text-left transition hover:bg-layer-2"
          onClick={onAddCropImage}
          type="button"
        >
          <span className="grid size-9 place-items-center rounded-control bg-layer-2 text-handle-image">
            <Crop aria-hidden="true" className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-text-primary">
              Crop Image
            </span>
            <span className="block truncate text-xs text-text-tertiary">
              FFmpeg crop with percent controls
            </span>
          </span>
          <ImageIcon aria-hidden="true" className="size-4 text-handle-image" />
        </button>
      </div>

      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="ghost">
          View all
        </Button>
      </div>
    </Panel>
  );
}
