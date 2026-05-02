"use client";

import {
  BookOpen,
  Gift,
  Grid3X3,
  Image,
  Library,
  Music,
  PanelLeft,
  Search,
  Settings,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigationGroups = [
  {
    title: "",
    items: [
      { label: "All Tools", icon: Grid3X3, count: "5933" },
      { label: "Free Credits", icon: Gift },
      { label: "Prompt Library", icon: BookOpen },
    ],
  },
  {
    title: "Generation History",
    items: [
      { label: "Image Library", icon: Image },
      { label: "Video Library", icon: Video },
      { label: "Audio Library", icon: Music },
    ],
  },
];

export function WorkflowSidebar() {
  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-border-primary bg-layer-1">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 text-2xl font-semibold tracking-normal text-text-primary">
          <span className="grid size-7 place-items-center rounded-full border-2 border-text-primary text-xs">
            ◎
          </span>
          Galaxy
        </div>
        <Button aria-label="Collapse sidebar" size="icon" variant="ghost">
          <PanelLeft aria-hidden="true" className="size-4" />
        </Button>
      </div>

      <div className="px-3">
        <div className="flex h-9 items-center gap-2 rounded-full border border-border-primary bg-layer-1 px-3 text-sm text-text-tertiary shadow-sm">
          <Search aria-hidden="true" className="size-4" />
          <span>Quick search...</span>
          <span className="ml-auto text-xs">⌘K</span>
        </div>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-2">
        {navigationGroups.map((group) => (
          <div className="mb-5" key={group.title || "primary"}>
            {group.title ? (
              <div className="px-3 pb-2 text-xs font-semibold text-text-tertiary">
                {group.title}
              </div>
            ) : null}
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  className="flex h-9 w-full items-center gap-3 rounded-control px-3 text-left text-sm font-medium text-text-secondary transition hover:bg-layer-2 hover:text-text-primary"
                  key={item.label}
                  type="button"
                >
                  <item.icon aria-hidden="true" className="size-4" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.count ? (
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                      {item.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3">
        <Button className="w-full" variant="secondary">
          <Settings aria-hidden="true" className="size-4" />
          Settings
        </Button>
        <Button className="mt-2 w-full" variant="primary">
          <Gift aria-hidden="true" className="size-4" />
          Claim Offer
        </Button>
      </div>
      <Separator />
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="grid size-8 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">
          A
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-text-primary">
            Aditya Singh
          </div>
          <div className="truncate text-xs text-text-tertiary">Builder</div>
        </div>
        <Library aria-hidden="true" className="ml-auto size-4 text-text-tertiary" />
      </div>
    </aside>
  );
}

