"use client";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import type { ReflexionStep } from "@/lib/mock/types";

const STEP_HOST: Record<ReflexionStep["id"], string> = {
  query: "falkordb.local",
  reflect: "reflector",
  approve: "policy",
};

const STEP_HOST_LABEL: Record<ReflexionStep["id"], string> = {
  query: "graph query",
  reflect: "claim audit",
  approve: "policy check",
};

function stepsToMarkdown(steps: ReflexionStep[]): string {
  return steps
    .map((s) => {
      const parts: string[] = [`**${s.label}**`];
      if (s.detail) parts.push(s.detail);
      parts.push(`\`${STEP_HOST_LABEL[s.id]}:${STEP_HOST[s.id]}\``);
      return `- ${parts.join(" — ")}`;
    })
    .join("\n");
}

export function ReflexionMarkers({
  steps,
  pending,
  reasoningSec,
}: {
  steps: ReflexionStep[];
  pending?: boolean;
  reasoningSec?: number;
}) {
  if (steps.length === 0) return null;
  return (
    <Reasoning
      isStreaming={pending ?? false}
      duration={pending ? undefined : reasoningSec}
    >
      <ReasoningTrigger />
      <ReasoningContent>{stepsToMarkdown(steps)}</ReasoningContent>
    </Reasoning>
  );
}
