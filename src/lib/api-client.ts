import { findMockAnswer } from "./mock/chats";
import { getNode } from "./mock/graph";
import type {
  ChatCitation,
  ChatMessageModel,
  ReflexionStep,
} from "./mock/types";

export interface QueryResult {
  messages: ChatMessageModel[];
  usedMock: boolean;
  liveFailed?: boolean;
}

function toCitations(nodeIds: string[]): ChatCitation[] {
  return nodeIds.map((nodeId, i) => ({
    index: i + 1,
    nodeId,
    snippet: getNode(nodeId)?.snippet ?? getNode(nodeId)?.label ?? nodeId,
  }));
}

function liveSteps(): ReflexionStep[] {
  return [
    { id: "query", label: "Querying FalkorDB...", status: "done" },
    { id: "reflect", label: "Reflector auditing claims...", status: "done" },
    { id: "approve", label: "Approved", status: "done" },
  ];
}

export function queryMock(query: string): ChatMessageModel[] {
  const answer = findMockAnswer(query);
  const userMsg: ChatMessageModel = {
    id: `u-${Date.now()}`,
    role: "user",
    text: query,
  };
  const asstMsg: ChatMessageModel = {
    id: `a-${Date.now()}`,
    role: "assistant",
    text: answer.answerMarkdown,
    citations: toCitations(answer.citationNodeIds),
    steps: answer.steps ?? liveSteps(),
    guardrail: answer.guardrail,
    temporalNote: answer.temporalNote,
    deniedNodeIds: answer.deniedNodeIds,
  };
  return [userMsg, asstMsg];
}

async function queryLive(
  baseUrl: string,
  query: string,
): Promise<ChatMessageModel[]> {
  const clean = baseUrl.replace(/\/$/, "");
  // Go through the Next proxy to avoid CORS + ngrok warnings.
  const res = await fetch("/api/backend/v1/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-backend-base": clean },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Live backend ${res.status}`);
  const data = await res.json();
  const userMsg: ChatMessageModel = {
    id: `u-${Date.now()}`,
    role: "user",
    text: query,
  };
  const asstMsg: ChatMessageModel = {
    id: `a-${Date.now()}`,
    role: "assistant",
    text: String(data.answer_markdown ?? data.answer ?? "(empty response)"),
    citations: Array.isArray(data.citations)
      ? data.citations.map(
          (
            c: { node_id?: string; nodeId?: string; snippet?: string },
            i: number,
          ) => ({
            index: i + 1,
            nodeId: String(c.node_id ?? c.nodeId ?? `live:${i}`),
            snippet: c.snippet,
          }),
        )
      : [],
    steps: Array.isArray(data.reflexion_steps)
      ? data.reflexion_steps
      : liveSteps(),
    guardrail: data.guardrails?.rbac_denied?.length ? "rbac" : "none",
    temporalNote: data.guardrails?.temporal_note,
    deniedNodeIds: data.guardrails?.rbac_denied ?? [],
  };
  return [userMsg, asstMsg];
}

/** Auto = try live, fall back to mock so the demo never dies. */
export async function queryAgent(opts: {
  query: string;
  mode: "mock" | "live" | "auto";
  baseUrl: string;
}): Promise<QueryResult> {
  if (opts.mode === "mock" || !opts.baseUrl.trim()) {
    return { messages: queryMock(opts.query), usedMock: true };
  }
  try {
    const messages = await queryLive(opts.baseUrl, opts.query);
    return { messages, usedMock: false };
  } catch {
    if (opts.mode === "auto") {
      return {
        messages: queryMock(opts.query),
        usedMock: true,
        liveFailed: true,
      };
    }
    throw new Error("Live backend unreachable. Switch to Mock or Auto.");
  }
}

export async function testBackendConnection(
  baseUrl: string,
): Promise<{ ok: boolean; latencyMs: number }> {
  const clean = baseUrl.replace(/\/$/, "");
  const start = performance.now();
  const res = await fetch(
    `/api/backend/health?base=${encodeURIComponent(clean)}`,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { ok: true, latencyMs: Math.round(performance.now() - start) };
}
