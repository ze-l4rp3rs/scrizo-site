"use client";

import type { ChatMessageModel, NodeId } from "@/lib/mock/types";
import { RbacCard, TemporalBanner } from "./GuardCards";

export function GuardCardsInline({
  message,
  onSelectNode,
}: {
  message: ChatMessageModel;
  onSelectNode: (nodeId: NodeId) => void;
}) {
  if (message.pending) return null;
  return (
    <div className="flex max-w-[80%] flex-col gap-2">
      {message.temporalNote ? (
        <TemporalBanner note={message.temporalNote} />
      ) : null}
      {message.guardrail === "rbac" ? (
        <RbacCard deniedCount={message.deniedNodeIds?.length ?? 1} />
      ) : null}
      {message.citations && message.citations.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {message.citations.map((c) => (
            <button
              key={c.index}
              type="button"
              onClick={() => onSelectNode(c.nodeId)}
              className="rounded-full border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              [{c.index}] {c.nodeId}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
