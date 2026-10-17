"use client";

import {
  ExternalLinkIcon,
  FileTextIcon,
  HistoryIcon,
  MenuIcon,
  NetworkIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { queryAgent } from "@/lib/api-client";
import { useBackendConfig } from "@/lib/backend-config";
import { getNode } from "@/lib/mock/graph";
import type {
  RecentSession,
  SessionSource,
  SessionStatus,
} from "@/lib/mock/sessions";
import {
  dedupeEvidence,
  getSession,
  mergeSources,
  sessionMessages,
} from "@/lib/mock/sessions";
import type {
  ChatMessageModel,
  GraphNode,
  NodeId,
  ReflexionStep,
} from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { BackendSettings } from "./BackendSettings";
import type { ReasoningDepth } from "./Composer";
import { Composer } from "./Composer";
import { Inspector } from "./Inspector";
import { ThreadMessage } from "./ThreadMessage";

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function sourceBadge(type: GraphNode["type"]): {
  label: string;
  icon: typeof FileTextIcon;
  tone: string;
} {
  if (type === "Document")
    return {
      label: "PDF / DOC",
      icon: FileTextIcon,
      tone: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
    };
  if (type === "Decision")
    return {
      label: "DECISION",
      icon: HistoryIcon,
      tone: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    };
  return {
    label: "GRAPH NODE",
    icon: NetworkIcon,
    tone: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  };
}

export function ChatShell({
  onOpenSidebar,
  sessionId,
  session,
  onThreadStarted,
  onThreadResolved,
}: {
  onOpenSidebar?: () => void;
  sessionId?: string | null;
  /** Current session record — carries persisted sources across thread switches. */
  session?: RecentSession | null;
  onThreadStarted?: (text: string) => string | null;
  onThreadResolved?: (
    id: string | null,
    status: SessionStatus,
    newSources?: SessionSource[],
  ) => void;
}) {
  const backend = useBackendConfig();
  // The session this mount belongs to — prop changes after mount are ignored
  // because the parent remounts via `key` whenever the thread truly changes.
  const mountSessionRef = useRef<string | null>(sessionId ?? null);
  const [messages, setMessages] = useState<ChatMessageModel[]>(() => {
    if (!sessionId) return [];
    const s = getSession(sessionId);
    // Processing sessions replay live on mount instead of showing a stale copy.
    if (!s || s.status === "processing") return [];
    return sessionMessages(s);
  });
  const [pending, setPending] = useState(false);
  const [liveFailed, setLiveFailed] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<NodeId | null>(null);

  // Evidence cards persist on the session record so they survive thread
  // switches; new answers append to what's already stored.
  const [sources, setSources] = useState<SessionSource[]>(
    session?.sources ?? [],
  );
  useEffect(() => {
    const fresh = dedupeEvidence(messages.flatMap((m) => m.citations ?? []));
    if (fresh.length === 0) return;
    setSources((prev) => mergeSources(prev, fresh));
  }, [messages]);

  // Esc closes the drawer on both desktop and mobile.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Resolve evidence ids into graph nodes for the drawer cards.
  const sourceCards = useMemo(
    () =>
      sources.flatMap((s) => {
        const node = getNode(s.nodeId);
        return node ? [{ node, matchPct: s.matchPct }] : [];
      }),
    [sources],
  );

  const handleCitation = (id: NodeId) => {
    setHighlightId(id);
    setDrawerOpen(true);
  };

  const send = useCallback(
    async (text: string, opts?: { depth?: ReasoningDepth }) => {
      const depth = opts?.depth ?? "mid";
      // Fresh empty thread: register the session first so the sidebar can
      // show it immediately with a processing orb.
      let threadId = mountSessionRef.current;
      if (!threadId) {
        threadId = onThreadStarted?.(text) ?? null;
        mountSessionRef.current = threadId;
      }
      const stage1: ReflexionStep[] =
        depth === "low"
          ? [
              {
                id: "query",
                label: "Querying FalkorDB graph...",
                status: "active",
              },
              { id: "approve", label: "Verified", status: "pending" },
            ]
          : [
              {
                id: "query",
                label: "Querying FalkorDB graph...",
                status: "active",
                ...(depth === "high"
                  ? { detail: "3-hop expansion · 12 nodes" }
                  : {}),
              },
              {
                id: "reflect",
                label: "Reflector auditing claims...",
                status: "pending",
              },
              { id: "approve", label: "Verified", status: "pending" },
            ];
      const stage2: ReflexionStep[] =
        depth === "low"
          ? [
              {
                id: "query",
                label: "Querying FalkorDB graph...",
                status: "done",
              },
              { id: "approve", label: "Verified", status: "active" },
            ]
          : [
              {
                id: "query",
                label: "Querying FalkorDB graph...",
                status: "done",
              },
              {
                id: "reflect",
                label: "Reflector auditing claims...",
                status: "active",
                ...(depth === "high"
                  ? { detail: "5 claims checked across sub-graphs" }
                  : {}),
              },
              { id: "approve", label: "Verified", status: "pending" },
            ];
      const pauseMs = depth === "high" ? 650 : 450;
      const userMsg: ChatMessageModel = {
        id: nextId("u"),
        role: "user",
        text,
      };
      const thinkingMsg: ChatMessageModel = {
        id: nextId("a-thinking"),
        role: "assistant",
        text: "",
        pending: true,
        steps: stage1,
      };
      setMessages((prev) => [...prev, userMsg, thinkingMsg]);
      setPending(true);
      setLiveFailed(false);
      const startedAt = Date.now();

      // Staged pill animation so ReflexionMarkers + shimmer are testable on mock.
      await new Promise((r) => setTimeout(r, pauseMs));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsg.id
            ? {
                ...m,
                steps: stage2,
              }
            : m,
        ),
      );
      await new Promise((r) => setTimeout(r, pauseMs));

      try {
        const result = await queryAgent({
          query: text,
          mode: backend.mode,
          baseUrl: backend.baseUrl,
        });
        setLiveFailed(Boolean(result.liveFailed));
        const [, answer] = result.messages;
        const reasoningSec = Math.max(
          2,
          Math.ceil((Date.now() - startedAt) / 1000),
        );
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== thinkingMsg.id),
          { ...answer, id: nextId("a"), reasoningSec },
        ]);
        // Report evidence so the layout persists it onto the session record.
        const fresh = dedupeEvidence(answer.citations);
        if (fresh.length > 0) {
          onThreadResolved?.(
            threadId,
            answer.guardrail === "rbac" ? "restricted" : "done",
            fresh,
          );
          // Fresh evidence arrived — expand the drawer to showcase it.
          setDrawerOpen(true);
        } else {
          onThreadResolved?.(
            threadId,
            answer.guardrail === "rbac" ? "restricted" : "done",
          );
        }
      } catch (e) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== thinkingMsg.id),
          {
            id: nextId("a-err"),
            role: "assistant",
            text:
              e instanceof Error
                ? e.message
                : "Backend failed. Switch to Mock.",
          },
        ]);
        onThreadResolved?.(threadId, "error");
      } finally {
        setPending(false);
      }
    },
    [backend, onThreadStarted, onThreadResolved],
  );

  // Replaying a still-processing session runs the live agent loop on mount.
  const autoSentRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sessionId || autoSentRef.current === sessionId) return;
    const s = getSession(sessionId);
    if (!s || s.status !== "processing") return;
    autoSentRef.current = sessionId;
    void send(s.query);
  }, [sessionId, send]);

  // Retry re-runs the agent loop for the user turn behind an assistant answer.
  const retryMessage = (assistantId: string) => {
    if (pending) return;
    const idx = messages.findIndex((m) => m.id === assistantId);
    if (idx < 0) return;
    const prevUser = [...messages.slice(0, idx)]
      .reverse()
      .find((m) => m.role === "user");
    if (prevUser) void send(prevUser.text);
  };

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl min-w-0 flex-1 flex-col gap-3 overflow-hidden p-4">
        {/* Floating overlay controls — no layout space, feed extends to the top. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3">
          {onOpenSidebar ? (
            <button
              type="button"
              onClick={onOpenSidebar}
              aria-label="Open sidebar"
              className="pointer-events-auto rounded-md border bg-background/80 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:bg-foreground/[0.04] hover:text-foreground md:hidden"
            >
              <MenuIcon className="size-4" />
            </button>
          ) : (
            <span />
          )}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {/* Persistent Sources toggle — labeled, shows evidence count. */}
            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              aria-expanded={drawerOpen}
              aria-controls="context-drawer"
              title="Sources / evidence"
              className={cn(
                "flex items-center gap-1.5 rounded-md border bg-background/80 px-2 py-1.5 pl-3 backdrop-blur transition-colors hover:bg-foreground/[0.04]",
                drawerOpen
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {drawerOpen ? (
                <PanelRightCloseIcon className="size-4" />
              ) : (
                <PanelRightOpenIcon className="size-4" />
              )}
              <span className="hidden text-xs font-medium sm:inline">
                Sources
              </span>
              <span
                className={cn(
                  "flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px]",
                  sourceCards.length > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground",
                )}
              >
                {sourceCards.length}
              </span>
            </button>
            <BackendSettings
              baseUrl={backend.baseUrl}
              mode={backend.mode}
              effective={backend.effective}
              onBaseUrl={backend.setBaseUrl}
              onMode={backend.setMode}
              onReset={backend.reset}
            />
          </div>
        </div>

        {liveFailed ? (
          <p className="shrink-0 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
            Live backend failed — fell back to mock so the demo keeps running.
          </p>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.03)] dark:border-zinc-800 dark:bg-zinc-900">
          <MessageScrollerProvider>
            <MessageScroller className="min-h-0 flex-1">
              <MessageScrollerViewport className="p-4">
                <MessageScrollerContent>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                      <p className="font-heading text-lg font-medium">
                        Ask how the company works
                      </p>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Every answer carries clickable proof. Try an ownership
                        question, a decision trail, or a restricted doc.
                      </p>
                    </div>
                  ) : (
                    messages.map((m, idx) => (
                      <MessageScrollerItem
                        key={m.id}
                        messageId={m.id}
                        scrollAnchor={idx === messages.length - 1}
                      >
                        <ThreadMessage
                          message={m}
                          onSelectNode={handleCitation}
                          onRetry={
                            m.role === "assistant" && !m.pending
                              ? () => retryMessage(m.id)
                              : undefined
                          }
                        />
                      </MessageScrollerItem>
                    ))
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
          <div className="shrink-0 border-t p-3">
            <Composer onSend={send} pending={pending} />
          </div>
        </div>
      </div>

      {/* Desktop: always-mounted side-by-side panel that shrinks the chat when
          open — staying mounted makes the width collapse animate smoothly. */}
      <aside
        id="context-drawer"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
        className={cn(
          "hidden shrink-0 flex-col overflow-hidden transition-all duration-300 ease-in-out md:flex",
          drawerOpen
            ? "w-96 border-l border-zinc-200/80 bg-white opacity-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] lg:w-[420px] dark:border-zinc-800/60 dark:bg-zinc-900"
            : "w-0 border-l-0 opacity-0",
        )}
      >
        <ContextDrawerBody
          sources={sourceCards}
          highlightId={highlightId}
          onClose={() => setDrawerOpen(false)}
          onInspect={setSelectedNode}
        />
      </aside>

      {/* Mobile: overlay sheet — covers chat, never pushes it. */}
      <div
        aria-hidden={!drawerOpen}
        onClick={() => setDrawerOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-all duration-300 ease-in-out md:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-hidden={!drawerOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-zinc-200/80 bg-white shadow-2xl transition-all duration-300 ease-in-out dark:border-zinc-800/60 dark:bg-zinc-900 md:hidden",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <ContextDrawerBody
          sources={sourceCards}
          highlightId={highlightId}
          onClose={() => setDrawerOpen(false)}
          onInspect={setSelectedNode}
        />
      </aside>

      <Inspector
        nodeId={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSelectNode={setSelectedNode}
      />
    </div>
  );
}

function ContextDrawerBody({
  sources,
  highlightId,
  onClose,
  onInspect,
}: {
  sources: { node: GraphNode; matchPct: number }[];
  highlightId: NodeId | null;
  onClose: () => void;
  onInspect: (id: NodeId) => void;
}) {
  return (
    <>
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            Retrieved Context & Sources
          </p>
          <p className="text-xs text-muted-foreground">
            {sources.length === 0
              ? "No evidence yet"
              : `${sources.length} piece${sources.length === 1 ? "" : "s"} of evidence`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sources panel"
          title="Close sources panel"
          className="shrink-0 rounded-md border p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {sources.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 py-10 text-center">
            <NetworkIcon className="size-5 text-zinc-500" />
            <p className="max-w-45 text-xs text-zinc-400">
              Answers with citations will surface their FalkorDB evidence cards
              here.
            </p>
          </div>
        ) : (
          sources.map(({ node, matchPct }) => {
            const badge = sourceBadge(node.type);
            const highlighted = highlightId === node.id;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => onInspect(node.id)}
                title={`${node.label} — open proof trail`}
                className={cn(
                  "group w-full cursor-pointer rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 text-left shadow-sm transition-all hover:border-zinc-700/80 hover:bg-zinc-900",
                  highlighted &&
                    "border-primary/60 ring-1 ring-primary/40 dark:border-zinc-600",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase",
                        badge.tone,
                      )}
                    >
                      <badge.icon className="size-3" />
                      {badge.label}
                    </span>
                    {node.restricted ? (
                      <span className="flex shrink-0 items-center rounded-md border border-orange-500/40 bg-orange-500/10 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-orange-400 uppercase">
                        Restricted
                      </span>
                    ) : null}
                  </div>
                  <ExternalLinkIcon className="size-3.5 shrink-0 text-zinc-600 transition-colors group-hover:text-indigo-400" />
                </div>
                <p className="mt-2.5 truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-white">
                  {node.label}
                </p>
                {node.snippet ? (
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-400">
                    {node.snippet}
                  </p>
                ) : null}
                <div className="mt-3 border-t border-zinc-800/60 pt-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <ShieldCheckIcon className="size-3 shrink-0 text-emerald-500" />
                    {matchPct}% Match • Verified by Reflector
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}
