"use client";

import { cn } from "cn";
import {
  ChevronDownIcon,
  LayersIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { formatSessionTime } from "@/lib/mock/sessions";

export interface SidebarSession {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  sessions: SidebarSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

const AGENTS = [
  { icon: UsersIcon, label: "Atlas Agent" },
  { icon: LayersIcon, label: "Pricing Agent" },
  { icon: ShieldCheckIcon, label: "Guard Demo" },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 mb-1 flex items-center justify-between px-2">
      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/70">
        {children}
      </span>
    </div>
  );
}

export function ChatSidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ChatSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-foreground/[0.02]">
      {/* Workspace */}
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 border-b border-border/60 px-3.5 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="size-7 shrink-0 rounded-md bg-primary/70 ring-1 ring-border/60" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">Acme inc.</div>
            <div className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Pro · 24 members
            </div>
          </div>
        </div>
        <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
      </button>

      {/* New chat + search */}
      <div className="flex flex-col gap-2 px-3 pt-3">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-md bg-primary px-2.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <PlusIcon className="size-4" />
          New chat
        </button>
        <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5">
          <SearchIcon className="size-3.5 shrink-0 opacity-50" />
          <span className="flex-1 truncate text-xs text-muted-foreground">
            Quick find…
          </span>
          <kbd className="rounded border border-border/60 bg-background/80 px-1 font-mono text-[9px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Lists */}
      <nav className="mt-3 flex-1 overflow-y-auto px-2 pb-4">
        <SectionLabel>Chats</SectionLabel>
        <ul className="flex flex-col gap-0.5">
          {sessions.map((s) => {
            const active = s.id === activeId;
            return (
              <li key={s.id}>
                <div
                  className={cn(
                    "group flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-foreground/[0.06] text-foreground"
                      : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(s.id)}
                    className="min-w-0 flex-1 truncate text-left"
                  >
                    {s.title}
                  </button>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground/60">
                      {formatSessionTime(s.updatedAt)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Delete ${s.title}`}
                      onClick={() => onDelete(s.id)}
                      className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-foreground/[0.06]"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <SectionLabel>Agents</SectionLabel>
        <ul className="flex flex-col gap-0.5">
          {AGENTS.map((a) => (
            <li key={a.label}>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.03] hover:text-foreground"
              >
                <a.icon className="size-4 opacity-70" />
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-border/60 px-3 py-2.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-medium text-background">
          S
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">S</div>
          <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
            employee · Online
          </div>
        </div>
        <button
          type="button"
          aria-label="Settings"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
        >
          <SettingsIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
