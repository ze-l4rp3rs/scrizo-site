"use client";

import {
  ActivityIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  MessageSquarePlusIcon,
  MonitorIcon,
  MoonIcon,
  MoreHorizontalIcon,
  NetworkIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SunIcon,
  SunMoonIcon,
  Trash2Icon,
  UsersIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RECENT_SESSIONS,
  type RecentSession,
  STATUS_META,
} from "@/lib/mock/sessions";
import { cn } from "@/lib/utils";

export type WorkspaceView = "chat" | "graph" | "proofs" | "team";

const NAV_ITEMS: {
  id: WorkspaceView;
  icon: typeof MessageSquarePlusIcon;
  label: string;
  hint: string;
  badge?: number;
}[] = [
  {
    id: "chat",
    icon: MessageSquarePlusIcon,
    label: "New Chat",
    hint: "Start a fresh agent thread",
  },
  {
    id: "graph",
    icon: NetworkIcon,
    label: "Knowledge Graph",
    hint: "FalkorDB node visualization",
  },
  {
    id: "proofs",
    icon: BookmarkIcon,
    label: "Saved Proofs",
    hint: "Verified answers + citations",
    badge: 2,
  },
  {
    id: "team",
    icon: UsersIcon,
    label: "Team Directory",
    hint: "Who knows what",
  },
];

const UTILITY_ITEMS = [
  {
    id: "usage" as const,
    icon: ActivityIcon,
    label: "Check Usage",
    hint: "Tokens, queries, Reflexion health",
  },
  {
    id: "plan" as const,
    icon: ShieldCheckIcon,
    label: "Subscription & Clearance",
    hint: "Pro tier + RBAC level",
  },
  {
    id: "appearance" as const,
    icon: SunMoonIcon,
    label: "Appearance",
    hint: "Dark / Light / System",
  },
];

export interface WorkspaceRailProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  activeView?: WorkspaceView;
  onSelectView?: (view: WorkspaceView) => void;
  onNewChat?: () => void;
  activeSessionId?: string | null;
  onSelectSession?: (id: string) => void;
  sessions?: RecentSession[];
  /** Toggle pin on a session (controlled chat state). */
  onPinSession?: (id: string) => void;
  /** Commit a renamed title (controlled chat state). */
  onRenameSession?: (id: string, title: string) => void;
  /** Remove a session; parent clears the active chat if it was deleted. */
  onDeleteSession?: (id: string) => void;
  className?: string;
}

export function WorkspaceRail({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onCloseMobile,
  activeView,
  onSelectView,
  onNewChat,
  activeSessionId,
  onSelectSession,
  sessions,
  onPinSession,
  onRenameSession,
  onDeleteSession,
  className = "",
}: WorkspaceRailProps) {
  const [internalView, setInternalView] = useState<WorkspaceView>("chat");
  const [internalSessionId, setInternalSessionId] = useState<string | null>(
    null,
  );
  const [internalSessions, setInternalSessions] =
    useState<RecentSession[]>(RECENT_SESSIONS);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [usageOpen, setUsageOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  const view = activeView ?? internalView;
  const sessionId = activeSessionId ?? internalSessionId;
  const sessionList = sessions ?? internalSessions;

  const handleSelect = (v: WorkspaceView) => {
    if (onSelectView) onSelectView(v);
    else setInternalView(v);
    onCloseMobile?.();
  };

  const handleNewChat = () => {
    if (onNewChat) onNewChat();
    else {
      setInternalSessionId(null);
      setInternalView("chat");
    }
    onCloseMobile?.();
  };

  const handleSelectSession = (id: string) => {
    if (onSelectSession) onSelectSession(id);
    else {
      setInternalSessionId(id);
      setInternalView("chat");
    }
    onCloseMobile?.();
  };

  const handlePinSession = (id: string) => {
    if (onPinSession) onPinSession(id);
    else
      setInternalSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s)),
      );
  };

  const commitRename = (id: string, title: string) => {
    setEditingSessionId(null);
    const next = title.trim();
    if (!next) return;
    if (onRenameSession) onRenameSession(id, next);
    else
      setInternalSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: next } : s)),
      );
  };

  const handleDeleteSession = (id: string) => {
    if (onDeleteSession) {
      onDeleteSession(id);
    } else {
      setInternalSessions((prev) => prev.filter((s) => s.id !== id));
      if (sessionId === id) {
        setInternalSessionId(null);
        setInternalView("chat");
      }
    }
  };

  const openUtility = (id: "usage" | "plan" | "appearance") => {
    if (id === "usage") setUsageOpen(true);
    else if (id === "plan") setPlanOpen(true);
    else setAppearanceOpen(true);
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobile?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onCloseMobile]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop: expanded sidebar or collapsed icon-only rail */}
      <aside
        className={cn(
          "hidden h-svh shrink-0 flex-col overflow-hidden border-r border-border/60 bg-foreground/[0.02] transition-all duration-300 ease-in-out md:flex",
          collapsed ? "w-16" : "w-64",
          className,
        )}
      >
        <RailContent
          collapsed={collapsed}
          onToggle={onToggle}
          view={view}
          onSelectView={handleSelect}
          onNewChat={handleNewChat}
          sessionId={sessionId}
          sessions={sessionList}
          onSelectSession={handleSelectSession}
          onPinSession={handlePinSession}
          onRenameSession={commitRename}
          onDeleteSession={handleDeleteSession}
          editingSessionId={editingSessionId}
          onStartEditSession={setEditingSessionId}
          onOpenUtility={openUtility}
        />
      </aside>

      {/* Mobile: backdrop */}
      <div
        aria-hidden={!mobileOpen}
        onClick={onCloseMobile}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-all duration-300 ease-in-out md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Mobile: overlay drawer (overlays content, never pushes it) */}
      <aside
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border/60 bg-background shadow-2xl transition-all duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <RailContent
          collapsed={false}
          isMobile
          onCloseMobile={onCloseMobile}
          view={view}
          onSelectView={handleSelect}
          onNewChat={handleNewChat}
          sessionId={sessionId}
          sessions={sessionList}
          onSelectSession={handleSelectSession}
          onPinSession={handlePinSession}
          onRenameSession={commitRename}
          onDeleteSession={handleDeleteSession}
          editingSessionId={editingSessionId}
          onStartEditSession={setEditingSessionId}
          onOpenUtility={openUtility}
        />
      </aside>

      <UsageDialog open={usageOpen} onOpenChange={setUsageOpen} />
      <PlanDialog open={planOpen} onOpenChange={setPlanOpen} />
      <AppearanceDialog
        open={appearanceOpen}
        onOpenChange={setAppearanceOpen}
      />
    </>
  );
}

export function SidebarsWorkspaceRailShowcasePage() {
  return (
    <div className="grid min-h-svh grid-cols-[260px_1fr] bg-background text-foreground">
      <WorkspaceRail />
      <main className="flex items-center justify-center px-10 text-muted-foreground">
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em]">
            Main pane
          </div>
          <p className="mt-1.5 text-sm">Sidebar showcase — content omitted.</p>
        </div>
      </main>
    </div>
  );
}

function RailContent({
  collapsed,
  onToggle,
  isMobile = false,
  onCloseMobile,
  view,
  onSelectView,
  onNewChat,
  sessionId,
  onSelectSession,
  sessions,
  onPinSession,
  onRenameSession,
  onDeleteSession,
  editingSessionId,
  onStartEditSession,
  onOpenUtility,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
  view: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  onNewChat: () => void;
  sessionId: string | null;
  onSelectSession: (id: string) => void;
  sessions: RecentSession[];
  onPinSession: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onDeleteSession: (id: string) => void;
  editingSessionId: string | null;
  onStartEditSession: (id: string | null) => void;
  onOpenUtility: (id: "usage" | "plan" | "appearance") => void;
}) {
  // Pinned chats float to the top (stable sort keeps original recency order).
  const orderedSessions = [...sessions].sort(
    (a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false),
  );
  return (
    <>
      <div
        className={cn(
          "flex shrink-0 border-b border-border/60 py-3",
          collapsed
            ? "flex-col items-center gap-1 px-2"
            : "items-center gap-1 px-3",
        )}
      >
        <RailTip label="Acme inc." enabled={collapsed}>
          <button
            type="button"
            title="Acme inc."
            className={cn(
              "flex min-w-0 items-center gap-2.5 rounded-md text-left transition-colors hover:bg-foreground/[0.03]",
              collapsed ? "justify-center p-1" : "min-w-0 flex-1 px-1 py-0.5",
            )}
          >
            <div className="size-7 shrink-0 rounded-md bg-gradient-to-br from-primary/70 to-primary/30 ring-1 ring-border/60" />
            {collapsed ? null : (
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-sm">Acme inc.</div>
                  <div className="truncate font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                    Pro · 24 members
                  </div>
                </div>
                <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
              </>
            )}
          </button>
        </RailTip>

        {isMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            title="Close sidebar"
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
          >
            {collapsed ? (
              <PanelLeftOpenIcon className="size-4" />
            ) : (
              <PanelLeftCloseIcon className="size-4" />
            )}
          </button>
        )}
      </div>

      <div className={cn("shrink-0 pt-3", collapsed ? "px-2" : "px-3")}>
        {collapsed ? (
          <RailTip label="Quick find" enabled>
            <button
              type="button"
              aria-label="Quick find"
              title="Quick find"
              className="flex w-full items-center justify-center rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5 transition-colors hover:bg-foreground/[0.03]"
            >
              <SearchIcon className="size-3.5 opacity-50" />
            </button>
          </RailTip>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5">
            <SearchIcon className="size-3.5 opacity-50" />
            <span className="flex-1 truncate text-muted-foreground text-xs">
              Quick find…
            </span>
            <kbd className="rounded border border-border/60 bg-background/80 px-1 font-mono text-[9px] text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        )}
      </div>

      <nav className="mt-3 min-h-0 shrink overflow-y-auto px-2">
        <SectionLabel hidden={collapsed}>Workspace</SectionLabel>
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            // "New Chat" reads active only in a fresh empty thread;
            // once a history session is open, the session row owns the highlight.
            const active =
              item.id === "chat"
                ? view === "chat" && sessionId == null
                : view === item.id;
            return (
              <li key={item.id}>
                <RailTip
                  label={`${item.label} — ${item.hint}`}
                  enabled={collapsed}
                >
                  <button
                    type="button"
                    title={`${item.label} — ${item.hint}`}
                    onClick={() =>
                      item.id === "chat" ? onNewChat() : onSelectView(item.id)
                    }
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      collapsed ? "justify-center" : "justify-between",
                      active
                        ? "bg-foreground/[0.06] text-foreground"
                        : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground",
                    )}
                  >
                    {collapsed ? (
                      <item.icon className="size-4 opacity-70" />
                    ) : (
                      <>
                        <span className="flex min-w-0 items-center gap-2.5">
                          <item.icon className="size-4 shrink-0 opacity-70" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badge ? (
                          <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 font-mono text-[9px] text-foreground">
                            {item.badge}
                          </span>
                        ) : null}
                      </>
                    )}
                  </button>
                </RailTip>
              </li>
            );
          })}
        </ul>
        <div className="mt-5 mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          {collapsed ? null : "Recent Chats"}
        </div>
        <ul className="flex flex-col gap-0.5">
          {orderedSessions.map((s) => {
            const meta = STATUS_META[s.status];
            const selected = sessionId === s.id;
            const editing = editingSessionId === s.id;
            return (
              <li key={s.id}>
                <RailTip
                  label={`${s.title} — ${meta.label}`}
                  enabled={collapsed}
                >
                  {editing && !collapsed ? (
                    <input
                      // biome-ignore lint/a11y/noAutofocus: inline rename needs immediate keyboard focus
                      autoFocus
                      defaultValue={s.title}
                      aria-label="Rename chat"
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter")
                          onRenameSession(s.id, e.currentTarget.value);
                        if (e.key === "Escape") onStartEditSession(null);
                      }}
                      onBlur={(e) =>
                        onRenameSession(s.id, e.currentTarget.value)
                      }
                      className="w-full rounded-lg border border-ring/60 bg-background px-3 py-1.5 text-sm outline-none"
                    />
                  ) : (
                    <div
                      className={cn(
                        "group/session-row flex w-full items-center rounded-lg text-sm transition-colors",
                        collapsed ? "justify-center" : "pr-1",
                        selected
                          ? "bg-foreground/[0.06] text-foreground"
                          : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground",
                      )}
                    >
                      <button
                        type="button"
                        title={`${s.title} — ${meta.label}`}
                        onClick={() => onSelectSession(s.id)}
                        aria-current={selected ? "true" : undefined}
                        className={cn(
                          "flex min-w-0 flex-1 items-center gap-2 text-left",
                          collapsed ? "justify-center py-1.5" : "py-1.5 pl-3",
                        )}
                      >
                        <span
                          title={meta.label}
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            meta.dot,
                          )}
                        />
                        {collapsed ? null : (
                          <span className="min-w-0 flex-1 truncate">
                            {s.title}
                          </span>
                        )}
                        {s.pinned ? (
                          <PinIcon className="size-3 shrink-0 text-primary/70" />
                        ) : null}
                      </button>
                      {collapsed ? null : (
                        <ChatSessionMenu
                          pinned={Boolean(s.pinned)}
                          onPin={() => onPinSession(s.id)}
                          onRename={() => onStartEditSession(s.id)}
                          onDelete={() => onDeleteSession(s.id)}
                        />
                      )}
                    </div>
                  )}
                </RailTip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Flexible spacer — absorbs extra vertical height. */}
      <div aria-hidden="true" className="flex-1" />

      {/* Bottom: Insights anchored directly above the profile footer. */}
      <div className="shrink-0 px-2 pb-2">
        <SectionLabel hidden={collapsed}>Insights</SectionLabel>
        <ul className="flex flex-col gap-0.5">
          {UTILITY_ITEMS.map((item) => (
            <li key={item.id}>
              <RailTip
                label={`${item.label} — ${item.hint}`}
                enabled={collapsed}
              >
                <button
                  type="button"
                  title={`${item.label} — ${item.hint}`}
                  onClick={() => onOpenUtility(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-foreground/[0.03] hover:text-foreground",
                    collapsed && "justify-center",
                  )}
                >
                  <item.icon className="size-4 shrink-0 opacity-70" />
                  {collapsed ? null : (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              </RailTip>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={cn(
          "flex shrink-0 border-t border-border/60 py-2.5",
          collapsed
            ? "flex-col items-center gap-2 px-2"
            : "items-center gap-2 px-3",
        )}
      >
        <RailTip label="Sean Brydon" enabled={collapsed}>
          <div
            title="Sean Brydon"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground font-medium text-[11px] text-background"
          >
            S
          </div>
        </RailTip>
        {collapsed ? null : (
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-sm">Sean Brydon</div>
            <div className="flex items-center gap-1.5 truncate text-muted-foreground text-xs">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Online
            </div>
          </div>
        )}
        <RailTip label="Settings" enabled={collapsed}>
          <button
            type="button"
            title="Settings"
            aria-label="Settings"
            onClick={() => onOpenUtility("appearance")}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <SettingsIcon className="size-4" />
          </button>
        </RailTip>
      </div>
    </>
  );
}

function UsageDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const rows = [
    { label: "LLM tokens", value: "128,400 / 500,000", pct: 26 },
    { label: "FalkorDB queries", value: "1,284 this month", pct: 43 },
    { label: "Reflexion success", value: "98.2% · 312 runs", pct: 98 },
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ActivityIcon className="size-4" />
            Usage
          </DialogTitle>
          <DialogDescription>
            Current period — Company Brain demo workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-mono text-xs">{r.value}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${r.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlanDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ZapIcon className="size-4" />
            Subscription & Clearance
          </DialogTitle>
          <DialogDescription>
            Tier controls model limits — clearance controls graph access.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Plan</span>
            <Badge>Pro · 24 members</Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">RBAC level</span>
            <Badge variant="secondary">Level 2 · Employee</Badge>
          </div>
          <div className="rounded-lg border p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Clearance</p>
            <p className="mt-1">
              Can read Projects, People, public Docs and Decisions. Restricted
              nodes (e.g. Q3 Salary Bands) stay locked — request access from
              People Ops.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AppearanceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? (theme ?? "system") : "system";

  const options = [
    { id: "light", icon: SunIcon, label: "Light", hint: "Bright workspace" },
    { id: "dark", icon: MoonIcon, label: "Dark", hint: "Dim for night ops" },
    { id: "system", icon: MonitorIcon, label: "System", hint: "Follow OS" },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SunMoonIcon className="size-4" />
            Appearance
          </DialogTitle>
          <DialogDescription>
            Theme applies instantly and persists on this device.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          {options.map((o) => {
            const selected = current === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setTheme(o.id)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  selected
                    ? "bg-foreground/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground",
                )}
              >
                <o.icon className="size-4 shrink-0 opacity-70" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{o.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {o.hint}
                  </span>
                </span>
                {selected ? <CheckIcon className="size-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RailTip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled: boolean;
  children: ReactElement;
}) {
  if (!enabled) return children;
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function ChatSessionMenu({
  pinned,
  onPin,
  onRename,
  onDelete,
}: {
  pinned: boolean;
  onPin: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        onClick={(e) => e.stopPropagation()}
        title="Chat options"
        aria-label="Chat options"
        className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-0 outline-none transition-opacity group-hover/session-row:opacity-100 hover:text-foreground focus-visible:opacity-100 data-[popup-open]:opacity-100"
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className="rounded-lg border-zinc-800 bg-zinc-900 text-xs text-zinc-200 shadow-xl"
      >
        <DropdownMenuItem
          onClick={onPin}
          className="text-xs focus:bg-zinc-800 focus:text-zinc-100"
        >
          {pinned ? <PinOffIcon /> : <PinIcon />}
          {pinned ? "Unpin Chat" : "Pin Chat"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onRename}
          className="text-xs focus:bg-zinc-800 focus:text-zinc-100"
        >
          <PencilIcon />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          variant="destructive"
          onClick={onDelete}
          className="text-xs focus:bg-zinc-800"
        >
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SectionLabel({
  hidden,
  children,
}: {
  hidden?: boolean;
  children: ReactNode;
}) {
  if (hidden) return null;
  return (
    <div className="mt-5 mb-1 flex items-center justify-between px-2">
      <span className="font-mono text-[9px] text-muted-foreground/70 uppercase tracking-[0.25em]">
        {children}
      </span>
    </div>
  );
}
