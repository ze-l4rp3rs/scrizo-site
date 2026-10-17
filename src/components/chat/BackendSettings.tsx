"use client";

import { Plug, RotateCcw, Settings2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { testBackendConnection } from "@/lib/api-client";
import type { BackendMode } from "@/lib/mock/types";

export function BackendSettings({
  baseUrl,
  mode,
  effective,
  onBaseUrl,
  onMode,
  onReset,
}: {
  baseUrl: string;
  mode: BackendMode;
  effective: "mock" | "live";
  onBaseUrl: (url: string) => void;
  onMode: (m: BackendMode) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(baseUrl);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  const test = async () => {
    const url = draft.trim();
    if (!url) {
      setTestMsg("Enter an ngrok URL first.");
      return;
    }
    setTesting(true);
    setTestMsg(null);
    try {
      const r = await testBackendConnection(url);
      setTestMsg(`OK — ${r.latencyMs}ms. Switch to Live or Auto.`);
      onBaseUrl(url);
    } catch (e) {
      setTestMsg(e instanceof Error ? e.message : "Connection failed.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            title={`Backend: ${effective} (temporary dev setting)`}
            aria-label="Backend settings"
            className="rounded-md border bg-background/80 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <Settings2 className="size-4" />
          </button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plug className="size-4" /> Backend (temp, dev only)
          </DialogTitle>
          <DialogDescription>
            Paste your teammate&apos;s ngrok URL to test live. Default stays on
            mock — never commit URLs.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex gap-1.5">
            {(["mock", "live", "auto"] as BackendMode[]).map((m) => (
              <Button
                key={m}
                size="sm"
                variant={mode === m ? "default" : "outline"}
                onClick={() => onMode(m)}
              >
                {m[0].toUpperCase() + m.slice(1)}
              </Button>
            ))}
          </div>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="https://xxxx.ngrok-free.app"
            spellCheck={false}
          />
          {testMsg ? (
            <p className="text-xs text-muted-foreground">{testMsg}</p>
          ) : null}
          <div className="flex gap-2">
            <Button size="sm" onClick={test} disabled={testing}>
              {testing ? "Testing…" : "Test + save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onReset();
                setDraft("");
                setTestMsg(null);
              }}
            >
              <RotateCcw /> Reset to mock
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Empty URL always stays on mock — the demo never crashes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
