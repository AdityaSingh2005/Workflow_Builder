"use client";

import { FileJson, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type WorkflowBottomToolbarProps = {
  pickerOpen: boolean;
  onTogglePicker: () => void;
};

export function WorkflowBottomToolbar({
  pickerOpen,
  onTogglePicker,
}: WorkflowBottomToolbarProps) {
  return (
    <Panel className="absolute bottom-6 left-1/2 z-20 flex h-12 -translate-x-1/2 items-center gap-1 px-2 shadow-floating">
      <Button aria-label="Import workflow JSON" size="icon" variant="ghost">
        <FileJson aria-hidden="true" className="size-5" />
      </Button>
      <div className="h-6 w-px bg-border-secondary" />
      <Button
        aria-label={pickerOpen ? "Close node picker" : "Open node picker"}
        onClick={onTogglePicker}
        size="icon"
        variant="ghost"
      >
        <Plus aria-hidden="true" className="size-5" />
      </Button>
    </Panel>
  );
}

