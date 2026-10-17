"use client";

import {
  BookmarkCheckIcon,
  BookmarkIcon,
  MenuIcon,
  NetworkIcon,
  SearchIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MOCK_ANSWERS } from "@/lib/mock/chats";
import { EDGES, NODES } from "@/lib/mock/graph";
import type { ChatMessageModel, NodeId } from "@/lib/mock/types";
import { Inspector } from "./Inspector";
import { ThreadMessage } from "./ThreadMessage";

const GraphView = dynamic(
  () => import("./GraphView").then((m) => m.GraphView),
  {
    ssr: false,
    loading: () => <div className="h-64 rounded-xl border bg-muted/30" />,
  },
);

function PanelShell({
  onOpenSidebar,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  onOpenSidebar?: () => void;
  icon: typeof NetworkIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col gap-3 overflow-hidden p-4">
      <header className="flex shrink-0 flex-wrap items-center gap-2">
        {onOpenSidebar ? (
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground md:hidden"
          >
            <MenuIcon className="size-4" />
          </button>
        ) : null}
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Icon className="size-4" />
          </span>
          <div>
            <h1 className="font-heading text-base font-semibold leading-none">
              {title}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

export function GraphPanel({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);
  const allIds = useMemo(() => NODES.map((n) => n.id), []);

  return (
    <PanelShell
      onOpenSidebar={onOpenSidebar}
      icon={NetworkIcon}
      title="Knowledge Graph"
      subtitle="Full FalkorDB node visualization — click any node to inspect"
    >
      <div className="min-h-0 flex-1 overflow-hidden">
        <GraphView
          focusNodeIds={allIds}
          onSelectNode={setSelectedNode}
          className="h-full min-h-0"
        />
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {[
          ["Person", "bg-sky-500"],
          ["Team", "bg-violet-500"],
          ["Project", "bg-emerald-500"],
          ["Document", "bg-amber-500"],
          ["Decision", "bg-rose-500"],
        ].map(([label, dot]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-sm ${dot}`} />
            {label}
          </span>
        ))}
      </div>
      <Inspector
        nodeId={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSelectNode={setSelectedNode}
      />
    </PanelShell>
  );
}

const SAVED_IDS = ["atlas-owner", "pricing-why"];
const SAVED_QUESTIONS: Record<string, string> = {
  "atlas-owner": "Who owns Atlas launch?",
  "pricing-why": "Why was pricing changed?",
};

function savedMessage(id: string): ChatMessageModel | null {
  const answer = MOCK_ANSWERS.find((a) => a.id === id);
  if (!answer) return null;
  return {
    id: `saved-${id}`,
    role: "assistant",
    text: answer.answerMarkdown.replaceAll("**", ""),
    citations: answer.citationNodeIds.map((nodeId, i) => ({
      index: i + 1,
      nodeId,
    })),
    steps: answer.steps,
    guardrail: answer.guardrail,
    temporalNote: answer.temporalNote,
    deniedNodeIds: answer.deniedNodeIds,
  };
}

export function ProofsPanel({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const [savedIds, setSavedIds] = useState<string[]>(SAVED_IDS);
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);

  const toggle = (id: string) =>
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  return (
    <PanelShell
      onOpenSidebar={onOpenSidebar}
      icon={BookmarkIcon}
      title="Saved Proofs"
      subtitle="Bookmarked verified answers with anti-hallucination citation traces"
    >
      {savedIds.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border py-10 text-center">
          <BookmarkIcon className="size-5 text-muted-foreground" />
          <p className="font-heading text-lg font-medium">No saved proofs</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Bookmark a verified answer from chat and its citation trace will
            appear here.
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {savedIds.map((id) => {
            const message = savedMessage(id);
            if (!message) return null;
            return (
              <div key={id} className="rounded-xl border bg-card p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">
                    {SAVED_QUESTIONS[id] ?? id}
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    <ShieldCheckIcon className="size-3" />
                    Verified
                  </Badge>
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    aria-label="Remove bookmark"
                    title="Remove bookmark"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
                  >
                    <BookmarkCheckIcon className="size-4" />
                  </button>
                </div>
                <ThreadMessage
                  message={message}
                  onSelectNode={setSelectedNode}
                />
              </div>
            );
          })}
        </div>
      )}
      <Inspector
        nodeId={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSelectNode={setSelectedNode}
      />
    </PanelShell>
  );
}

export function TeamPanel({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const [query, setQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);

  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NODES.filter((n) => {
      if (n.type !== "Person") return false;
      if (!q) return true;
      return `${n.label} ${n.snippet ?? ""} ${n.props?.role ?? ""} ${n.props?.team ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [query]);

  const statsFor = (personId: NodeId) => {
    let docs = 0;
    let decisions = 0;
    for (const e of EDGES) {
      if (e.from !== personId && e.to !== personId) continue;
      const other =
        e.from === personId
          ? NODES.find((n) => n.id === e.to)
          : NODES.find((n) => n.id === e.from);
      if (other?.type === "Document") docs += 1;
      if (other?.type === "Decision") decisions += 1;
    }
    return { docs, decisions };
  };

  return (
    <PanelShell
      onOpenSidebar={onOpenSidebar}
      icon={UsersIcon}
      title="Team Directory"
      subtitle="Who knows what — experts mapped to documents and decisions"
    >
      <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5">
        <SearchIcon className="size-3.5 shrink-0 opacity-50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search experts by name, role, or team…"
          aria-label="Search experts"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {people.length === 0 ? (
          <p className="rounded-xl border py-10 text-center text-sm text-muted-foreground">
            No experts match “{query}”.
          </p>
        ) : (
          people.map((p) => {
            const stats = statsFor(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedNode(p.id)}
                className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-foreground/[0.02]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">
                  {p.label.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {p.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {p.props?.role ?? "Member"}
                    {p.props?.team ? ` · ${p.props.team}` : ""}
                  </span>
                </span>
                <span className="flex shrink-0 gap-1.5">
                  <Badge variant="secondary">{stats.docs} docs</Badge>
                  <Badge variant="secondary">{stats.decisions} decisions</Badge>
                </span>
              </button>
            );
          })
        )}
      </div>
      <Inspector
        nodeId={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSelectNode={setSelectedNode}
      />
    </PanelShell>
  );
}
