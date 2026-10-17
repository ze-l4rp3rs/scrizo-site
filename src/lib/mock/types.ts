// Shared mock graph + chat contract. Frontend-only, no backend imports.
// NodeId convention: "<prefix>:<slug>" e.g. "proj:atlas", "emp:maya".

export type NodeType = "Person" | "Team" | "Project" | "Document" | "Decision";

export type NodeId = string;

export interface GraphNode {
  id: NodeId;
  type: NodeType;
  label: string;
  snippet?: string;
  updatedAt?: string;
  restricted?: boolean;
  props?: Record<string, string>;
}

export interface GraphEdge {
  from: NodeId;
  to: NodeId;
  rel: string;
}

export type ReflexionStatus = "pending" | "active" | "done";

export interface ReflexionStep {
  id: "query" | "reflect" | "approve";
  label: string;
  status: ReflexionStatus;
  detail?: string;
}

export interface ChatCitation {
  index: number;
  nodeId: NodeId;
  snippet?: string;
}

export interface MockAnswer {
  id: string;
  /** lowercase keywords — first match wins */
  keywords: string[];
  answerMarkdown: string;
  citationNodeIds: NodeId[];
  steps?: ReflexionStep[];
  guardrail?: "none" | "rbac" | "temporal";
  temporalNote?: string;
  deniedNodeIds?: NodeId[];
}

export type BackendMode = "mock" | "live" | "auto";

export interface ChatMessageModel {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: ChatCitation[];
  steps?: ReflexionStep[];
  guardrail?: "none" | "rbac" | "temporal";
  temporalNote?: string;
  deniedNodeIds?: NodeId[];
  pending?: boolean;
  /** Seconds the Reflexion loop ran — powers the "Thought for X seconds" box. */
  reasoningSec?: number;
}
