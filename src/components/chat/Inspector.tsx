"use client";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getNeighbors, getNode } from "@/lib/mock/graph";
import type { NodeId } from "@/lib/mock/types";

const TYPE_COLOR: Record<string, string> = {
  Person: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  Team: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  Project: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Document: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Decision: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export function Inspector({
  nodeId,
  onClose,
  onSelectNode,
}: {
  nodeId: NodeId | null;
  onClose: () => void;
  onSelectNode: (id: NodeId) => void;
}) {
  const node = nodeId ? getNode(nodeId) : undefined;
  const neighbors = nodeId ? getNeighbors(nodeId) : { nodes: [], edges: [] };

  return (
    <Sheet
      open={nodeId !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Proof Inspector</SheetTitle>
          <SheetDescription>
            Click any citation to see the node + its trail.
          </SheetDescription>
        </SheetHeader>
        {!node ? (
          <p className="px-4 text-sm text-muted-foreground">
            Select a citation like [1] to inspect proof.
          </p>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
            <div className="flex items-center gap-2">
              <Badge className={TYPE_COLOR[node.type] ?? ""}>{node.type}</Badge>
              <span className="font-mono text-[11px] text-muted-foreground">
                {node.id}
              </span>
            </div>
            <div>
              <h3 className="font-heading text-lg font-medium">{node.label}</h3>
              {node.snippet ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {node.snippet}
                </p>
              ) : null}
              {node.updatedAt ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {node.updatedAt}
                </p>
              ) : null}
            </div>
            {node.props ? (
              <dl className="grid grid-cols-2 gap-2 rounded-lg border p-3 text-xs">
                {Object.entries(node.props).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Trail — Project ↔ Person ↔ Document ↔ Decision
              </p>
              <div className="flex flex-col gap-1.5">
                {neighbors.edges.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No linked nodes.
                  </p>
                ) : (
                  neighbors.edges.map((e, i) => (
                    <div
                      key={`${e.from}-${e.to}-${i}`}
                      className="flex items-center gap-2 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectNode(e.from)}
                        className="rounded border px-1.5 py-0.5 font-mono hover:bg-muted"
                      >
                        {e.from}
                      </button>
                      <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                        {e.rel}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectNode(e.to)}
                        className="rounded border px-1.5 py-0.5 font-mono hover:bg-muted"
                      >
                        {e.to}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            {neighbors.nodes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {neighbors.nodes.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => onSelectNode(n.id)}
                    className="rounded-full border px-2.5 py-1 text-xs hover:bg-muted"
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
