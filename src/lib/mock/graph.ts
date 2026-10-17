import type { GraphEdge, GraphNode, NodeId } from "./types";

export const NODES: GraphNode[] = [
  {
    id: "proj:atlas",
    type: "Project",
    label: "Atlas Launch",
    snippet: "Flagship Q3 launch — onboarding revamp + usage billing.",
    updatedAt: "2026-09-18",
    props: { status: "On track", owner: "Maya Chen" },
  },
  {
    id: "emp:maya",
    type: "Person",
    label: "Maya Chen",
    snippet: "Product lead, Atlas. Owns launch plan and pricing decision.",
    updatedAt: "2026-09-10",
    props: { role: "Product Lead", team: "Growth" },
  },
  {
    id: "emp:leo",
    type: "Person",
    label: "Leo Park",
    snippet: "Backend engineer, billing. Implements usage-based pricing.",
    updatedAt: "2026-09-08",
    props: { role: "Backend Engineer", team: "Growth" },
  },
  {
    id: "emp:priya",
    type: "Person",
    label: "Priya Nair",
    snippet: "People ops. Owns compensation docs (restricted).",
    updatedAt: "2026-09-01",
    props: { role: "People Ops", team: "People" },
  },
  {
    id: "team:growth",
    type: "Team",
    label: "Growth",
    snippet: "Owns activation, onboarding, pricing experiments.",
    updatedAt: "2026-08-20",
    props: { size: "8", lead: "Maya Chen" },
  },
  {
    id: "team:platform",
    type: "Team",
    label: "Platform",
    snippet: "Owns billing infra and FalkorDB graph pipeline.",
    updatedAt: "2026-08-15",
    props: { size: "6", lead: "Leo Park" },
  },
  {
    id: "doc:launch-plan",
    type: "Document",
    label: "Atlas Launch Plan v3",
    snippet: "Owner: Maya Chen. Milestones, risks, rollout phases.",
    updatedAt: "2026-09-18",
    props: { author: "Maya Chen", version: "v3" },
  },
  {
    id: "doc:pricing-memo",
    type: "Document",
    label: "Pricing Memo — Usage-based",
    snippet: "Why we moved from seats to usage in April 2026.",
    updatedAt: "2026-04-22",
    props: { author: "Maya Chen", version: "final" },
  },
  {
    id: "doc:salary-q3",
    type: "Document",
    label: "Q3 Salary Bands (Restricted)",
    snippet: "Compensation bands. Visible to People + managers only.",
    updatedAt: "2026-07-30",
    restricted: true,
    props: { owner: "Priya Nair", access: "restricted" },
  },
  {
    id: "dec:pricing-2026-04",
    type: "Decision",
    label: "Switch to usage-based pricing",
    snippet:
      "Decided 2026-04-18 by Maya + finance. Churn on seats forced move.",
    updatedAt: "2026-04-18",
    props: { decider: "Maya Chen", status: "approved" },
  },
  {
    id: "dec:atlas-scope-cut",
    type: "Decision",
    label: "Cut SSO from Atlas v1",
    snippet: "Cut to hit Sept date. SSO moves to v1.1.",
    updatedAt: "2026-08-02",
    props: { decider: "Maya Chen", status: "approved" },
  },
  {
    id: "proj:phoenix",
    type: "Project",
    label: "Phoenix Migration",
    snippet: "FalkorDB migration for company graph. Owner: Platform.",
    updatedAt: "2026-09-05",
    props: { status: "In progress", owner: "Leo Park" },
  },
];

export const EDGES: GraphEdge[] = [
  { from: "proj:atlas", to: "emp:maya", rel: "OWNED_BY" },
  { from: "proj:atlas", to: "team:growth", rel: "OWNED_BY_TEAM" },
  { from: "proj:atlas", to: "doc:launch-plan", rel: "DESCRIBED_BY" },
  { from: "proj:atlas", to: "dec:atlas-scope-cut", rel: "SHAPED_BY" },
  { from: "emp:maya", to: "team:growth", rel: "MEMBER_OF" },
  { from: "emp:leo", to: "team:platform", rel: "MEMBER_OF" },
  { from: "emp:leo", to: "proj:phoenix", rel: "WORKS_ON" },
  { from: "dec:pricing-2026-04", to: "doc:pricing-memo", rel: "DOCUMENTED_IN" },
  { from: "dec:pricing-2026-04", to: "emp:maya", rel: "DECIDED_BY" },
  { from: "doc:launch-plan", to: "emp:maya", rel: "AUTHORED_BY" },
  { from: "doc:salary-q3", to: "emp:priya", rel: "OWNED_BY" },
  { from: "proj:atlas", to: "dec:pricing-2026-04", rel: "USES_PRICING" },
];

const byId = new Map<NodeId, GraphNode>(NODES.map((n) => [n.id, n]));

export function getNode(id: NodeId): GraphNode | undefined {
  return byId.get(id);
}

export function getNeighbors(id: NodeId): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const edges = EDGES.filter((e) => e.from === id || e.to === id);
  const ids = new Set<NodeId>();
  for (const e of edges) {
    ids.add(e.from);
    ids.add(e.to);
  }
  ids.delete(id);
  return {
    nodes: [...ids].map((nid) => byId.get(nid)).filter((n) => n !== undefined),
    edges,
  };
}

export function searchNodes(query: string): GraphNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return NODES.slice(0, 6);
  return NODES.filter((n) =>
    `${n.label} ${n.snippet ?? ""} ${n.type}`.toLowerCase().includes(q),
  ).slice(0, 8);
}
