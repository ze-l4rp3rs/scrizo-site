import { createChat } from "@shadcn/helpers/ai-sdk";
import { getNode } from "./graph";
import type { MockAnswer } from "./types";

export const SUGGESTED_PROMPTS = [
  "Who owns Atlas launch?",
  "Why was pricing changed?",
  "Show Q3 salaries",
] as const;

const BASE_STEPS: MockAnswer["steps"] = [
  {
    id: "query",
    label: "Querying FalkorDB graph...",
    status: "done",
    detail: "MATCH (p:Project)-[*1..2]-(n) WHERE p.id='proj:atlas'",
  },
  {
    id: "reflect",
    label: "Reflector auditing claims...",
    status: "done",
    detail: "3 claims checked, 0 rejected",
  },
  { id: "approve", label: "Verified", status: "done" },
];

export const MOCK_ANSWERS: MockAnswer[] = [
  {
    id: "v2-delay",
    keywords: ["v2", "delayed"],
    answerMarkdown:
      "V2 slipped because SSO was cut from Atlas v1 to hit the September date [1]. The call moved SSO to v1.1 — the current plan is tracked in the Atlas snapshot [2].",
    citationNodeIds: ["dec:atlas-scope-cut", "proj:atlas"],
    steps: BASE_STEPS,
    guardrail: "none",
  },
  {
    id: "atlas-owner",
    keywords: ["atlas", "owner", "owns", "launch", "who"],
    answerMarkdown:
      "Atlas is owned by **Maya Chen** (Product Lead, Growth) [1]. The launch plan is tracked in *Atlas Launch Plan v3* [2] and the team owner is Growth.",
    citationNodeIds: ["emp:maya", "doc:launch-plan"],
    steps: BASE_STEPS,
    guardrail: "none",
  },
  {
    id: "pricing-why",
    keywords: ["pricing", "price", "changed", "why"],
    answerMarkdown:
      "We switched to usage-based pricing on **2026-04-18** [1] because seat-based churn was spiking. The rationale is in the *Pricing Memo* [2] — approved by Maya + finance.",
    citationNodeIds: ["dec:pricing-2026-04", "doc:pricing-memo"],
    steps: BASE_STEPS,
    guardrail: "none",
  },
  {
    id: "salary-rbac",
    keywords: ["salary", "salaries", "compensation", "pay", "q3"],
    answerMarkdown:
      "I found the Q3 salary bands, but they're restricted to People + managers. You're signed in as **employee**, so I can't show the contents.",
    citationNodeIds: ["doc:salary-q3"],
    steps: BASE_STEPS,
    guardrail: "rbac",
    deniedNodeIds: ["doc:salary-q3"],
  },
  {
    id: "stale-temporal",
    keywords: ["q2", "last quarter", "as of", "stale", "old"],
    answerMarkdown:
      "Showing the Atlas snapshot most people cite from Q2. Note the scope changed in August (SSO cut to v1.1).",
    citationNodeIds: ["proj:atlas", "dec:atlas-scope-cut"],
    steps: BASE_STEPS,
    guardrail: "temporal",
    temporalNote:
      "Showing data as of Q2 — 3 updates since. Latest: Atlas Launch Plan v3 (Sept 18).",
  },
];

export const FALLBACK_ANSWER: MockAnswer = {
  id: "fallback",
  keywords: [],
  answerMarkdown:
    "I searched the company graph and found related people, projects, and docs [1][2]. Try one of the suggested prompts — the mock covers Atlas ownership, pricing, and restricted salaries.",
  citationNodeIds: ["proj:atlas", "team:growth"],
  steps: BASE_STEPS,
  guardrail: "none",
};

export function findMockAnswer(query: string): MockAnswer {
  const q = query.toLowerCase();
  // Salary / RBAC first so "Show Q3 salaries" never matches the generic path.
  const salaryHit = MOCK_ANSWERS.find(
    (a) => a.guardrail === "rbac" && a.keywords.some((k) => q.includes(k)),
  );
  if (salaryHit) return salaryHit;
  for (const a of MOCK_ANSWERS) {
    if (a.keywords.some((k) => q.includes(k))) return a;
  }
  return FALLBACK_ANSWER;
}

export function mockAnswerToMarkdown(answer: MockAnswer): string {
  return answer.answerMarkdown;
}

export function citationSnippet(nodeId: string): string {
  return getNode(nodeId)?.snippet ?? getNode(nodeId)?.label ?? nodeId;
}

// --- Optional streaming transport for useChat (swap in later) ---
// Keeps the same mock data but streams through the real AI SDK lifecycle
// so MessageScroller / Bubble animations behave like production.
export const mockChat = createChat()
  .user("Who owns Atlas launch?")
  .assistant(({ writer }) => {
    writer.reasoning("Querying FalkorDB...", { delayMs: 30 });
    writer.sleep(350);
    writer.reasoning("Reflector auditing claims...", { delayMs: 30 });
    writer.sleep(350);
    writer.text(
      "Atlas is owned by **Maya Chen** (Product Lead, Growth). See the launch plan for milestones.",
    );
    writer.sourceDocument({
      sourceId: "emp:maya",
      mediaType: "text/plain",
      title: "Maya Chen — Product Lead",
    });
    writer.sourceDocument({
      sourceId: "doc:launch-plan",
      mediaType: "text/plain",
      title: "Atlas Launch Plan v3",
    });
  })
  .user("Why was pricing changed?")
  .assistant(({ writer }) => {
    writer.reasoning("Querying FalkorDB...", { delayMs: 30 });
    writer.sleep(300);
    writer.text(
      "We switched to usage-based pricing on 2026-04-18 — seat churn forced the move.",
    );
    writer.sourceDocument({
      sourceId: "dec:pricing-2026-04",
      mediaType: "text/plain",
      title: "Switch to usage-based pricing",
    });
  })
  .user("Show Q3 salaries")
  .assistant(({ writer }) => {
    writer.reasoning("Checking permissions...", { delayMs: 30 });
    writer.sleep(300);
    writer.text(
      "I found the Q3 salary bands, but they're restricted to People + managers.",
    );
  });
