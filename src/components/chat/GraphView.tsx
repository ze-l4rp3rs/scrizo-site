"use client";

import {
  Background,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  ReactFlow,
} from "@xyflow/react";
import { useMemo } from "react";
import "@xyflow/react/dist/style.css";
import { getNeighbors, getNode } from "@/lib/mock/graph";
import type { NodeId } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const TYPE_COLOR: Record<string, string> = {
  Person: "#0ea5e9",
  Team: "#8b5cf6",
  Project: "#10b981",
  Document: "#f59e0b",
  Decision: "#f43f5e",
};

export function GraphView({
  focusNodeIds,
  onSelectNode,
  className,
}: {
  focusNodeIds: NodeId[];
  onSelectNode: (id: NodeId) => void;
  className?: string;
}) {
  const { nodes, edges } = useMemo(() => {
    const ids = new Set<NodeId>();
    for (const id of focusNodeIds) {
      ids.add(id);
      for (const n of getNeighbors(id).nodes) ids.add(n.id);
    }
    if (ids.size === 0) {
      ids.add("proj:atlas");
      ids.add("emp:maya");
      ids.add("doc:launch-plan");
    }
    const list = [...ids]
      .map((id) => getNode(id))
      .filter((n) => n !== undefined);
    const rfNodes: Node[] = list.map((n, i) => ({
      id: n.id,
      position: { x: (i % 4) * 220, y: Math.floor(i / 4) * 140 },
      data: { label: `${n.type}: ${n.label}` },
      style: {
        border: `2px solid ${TYPE_COLOR[n.type] ?? "#888"}`,
        borderRadius: 12,
        padding: 8,
        background: "var(--card)",
        fontSize: 12,
        width: 200,
      },
    }));
    const seen = new Set<string>();
    const rfEdges: Edge[] = [];
    for (const n of list) {
      for (const e of getNeighbors(n.id).edges) {
        const key = `${e.from}->${e.to}`;
        if (!ids.has(e.from) || !ids.has(e.to) || seen.has(key)) continue;
        seen.add(key);
        rfEdges.push({
          id: key,
          source: e.from,
          target: e.to,
          label: e.rel,
          animated:
            focusNodeIds.includes(e.from) || focusNodeIds.includes(e.to),
        });
      }
    }
    return { nodes: rfNodes, edges: rfEdges };
  }, [focusNodeIds]);

  return (
    <div
      className={cn(
        "h-64 w-full overflow-hidden rounded-xl border bg-card",
        className,
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(_, node) => onSelectNode(node.id as NodeId)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <MiniMap pannable zoomable />
        <Controls />
      </ReactFlow>
    </div>
  );
}
