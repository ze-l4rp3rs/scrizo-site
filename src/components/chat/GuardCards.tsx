"use client";

import { Lock, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RbacCard({ deniedCount = 1 }: { deniedCount?: number }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5" size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lock className="size-4" />
          Restricted — request access
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {deniedCount} document{deniedCount === 1 ? "" : "s"} hidden by role
        policy (employee). Ask People Ops for access — the graph still proves it
        exists.
      </CardContent>
    </Card>
  );
}

export function TemporalBanner({ note }: { note: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
      <span>{note}</span>
    </div>
  );
}
