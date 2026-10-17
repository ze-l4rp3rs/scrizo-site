import { findMockAnswer } from "./chats";
import type { ChatCitation, ChatMessageModel, NodeId } from "./types";

export function formatSessionTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export type SessionStatus = "done" | "error" | "processing" | "restricted";

export interface SessionSource {
  nodeId: NodeId;
  matchPct: number;
}

export interface RecentSession {
  id: string;
  title: string;
  query: string;
  status: SessionStatus;
  updatedAt: string;
  /** Pinned chats float to the top of the Recent Chats list. */
  pinned?: boolean;
  /** Evidence cards retrieved during this chat — persists across switches. */
  sources?: SessionSource[];
}

/** Deterministic 94–99% match score derived from the node id. */
export function matchConfidence(nodeId: NodeId): number {
  let hash = 0;
  for (const ch of nodeId) hash = (hash + ch.charCodeAt(0)) % 997;
  return 94 + (hash % 6);
}

/** Dedupe citations into evidence cards (stable order, first occurrence wins). */
export function dedupeEvidence(
  citations: readonly ChatCitation[] | undefined,
): SessionSource[] {
  const seen = new Set<NodeId>();
  const out: SessionSource[] = [];
  for (const c of citations ?? []) {
    if (seen.has(c.nodeId)) continue;
    seen.add(c.nodeId);
    out.push({ nodeId: c.nodeId, matchPct: matchConfidence(c.nodeId) });
  }
  return out;
}

/** Union of two evidence lists, keeping order without duplicates. */
export function mergeSources(
  prev: SessionSource[],
  added: SessionSource[],
): SessionSource[] {
  const seen = new Set(prev.map((s) => s.nodeId));
  const out = [...prev];
  for (const a of added) {
    if (seen.has(a.nodeId)) continue;
    seen.add(a.nodeId);
    out.push(a);
  }
  return out;
}

export const RECENT_SESSIONS: RecentSession[] = [
  {
    id: "s-atlas-arch",
    title: "Atlas architecture review",
    query: "Who owns Atlas launch?",
    status: "done",
    updatedAt: "2026-09-18",
  },
  {
    id: "s-q3-budget",
    title: "Q3 budget allocation",
    query: "Show Q3 salaries",
    status: "restricted",
    updatedAt: "2026-09-15",
  },
  {
    id: "s-v2-delayed",
    title: "Why was V2 delayed?",
    query: "Why was V2 delayed?",
    status: "processing",
    updatedAt: "2026-09-12",
  },
  {
    id: "s-infra-audit",
    title: "Infra security audit",
    query: "Infra security audit",
    status: "error",
    updatedAt: "2026-09-08",
  },
];

export const STATUS_META: Record<
  SessionStatus,
  { dot: string; label: string }
> = {
  done: {
    dot: "bg-zinc-100 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.12)]",
    label: "Answered successfully",
  },
  error: {
    dot: "bg-red-500",
    label: "Run failed with an error",
  },
  processing: {
    dot: "bg-amber-400 animate-pulse",
    label: "Reflexion loop still running",
  },
  restricted: {
    dot: "bg-orange-500",
    label: "Blocked — outside your clearance",
  },
};

export function getSession(id: string): RecentSession | undefined {
  return RECENT_SESSIONS.find((s) => s.id === id);
}

/** Build a static thread for a finished session (done / restricted / error). */
export function sessionMessages(session: RecentSession): ChatMessageModel[] {
  const user: ChatMessageModel = {
    id: `hist-u-${session.id}`,
    role: "user",
    text: session.query,
  };
  if (session.status === "error") {
    return [
      user,
      {
        id: `hist-a-${session.id}`,
        role: "assistant",
        text: "Run failed: FalkorDB timed out while expanding neighbors. Retry the prompt or narrow the scope.",
      },
    ];
  }
  const answer = findMockAnswer(session.query);
  // Deterministic pseudo-duration for the "Thought for X seconds" box.
  let hash = 0;
  for (const ch of session.id) hash = (hash + ch.charCodeAt(0)) % 997;
  return [
    user,
    {
      id: `hist-a-${session.id}`,
      role: "assistant",
      text: answer.answerMarkdown,
      citations: answer.citationNodeIds.map((nodeId, i) => ({
        index: i + 1,
        nodeId,
      })),
      steps: answer.steps,
      guardrail: answer.guardrail,
      temporalNote: answer.temporalNote,
      deniedNodeIds: answer.deniedNodeIds,
      reasoningSec: 2 + (hash % 7),
    },
  ];
}
