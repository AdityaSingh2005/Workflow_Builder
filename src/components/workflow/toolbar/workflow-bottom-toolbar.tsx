"use client";

import { FileDown, FileUp, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type WorkflowBottomToolbarProps = {
  pickerOpen: boolean;
  importing?: boolean;
  exporting?: boolean;
  onExportWorkflow: () => void;
  onImportWorkflow: () => void;
  onTogglePicker: () => void;
};

export function WorkflowBottomToolbar({
  pickerOpen,
  importing,
  exporting,
  onExportWorkflow,
  onImportWorkflow,
  onTogglePicker,
}: WorkflowBottomToolbarProps) {
  return (
    <Panel className="absolute bottom-6 left-1/2 z-20 flex h-12 -translate-x-1/2 items-center gap-1 px-2 shadow-floating">
      <Button
        aria-label="Import workflow JSON"
        disabled={importing}
        onClick={onImportWorkflow}
        size="icon"
        title="Import workflow JSON"
        variant="ghost"
      >
        <FileUp aria-hidden="true" className="size-5" />
      </Button>
      <Button
        aria-label="Export workflow JSON"
        disabled={exporting}
        onClick={onExportWorkflow}
        size="icon"
        title="Export workflow JSON"
        variant="ghost"
      >
        <FileDown aria-hidden="true" className="size-5" />
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
