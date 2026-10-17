"use client";

import {
  ArrowUpIcon,
  BrainIcon,
  CheckIcon,
  PaperclipIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ReasoningDepth = "low" | "mid" | "high";

export interface ComposerOptions {
  depth: ReasoningDepth;
}

const DEPTHS: { id: ReasoningDepth; label: string; hint: string }[] = [
  { id: "low", label: "Low", hint: "Fast answer, single graph lookup." },
  { id: "mid", label: "Mid", hint: "Balanced, 2-step critique loop." },
  {
    id: "high",
    label: "High",
    hint: "Deep Reflexion, multi-hop sub-graph verification & anti-hallucination audit.",
  },
];

const MAX_LENGTH = 2000;
const MAX_HEIGHT = 128; // ~5 lines

export function Composer({
  onSend,
  pending,
}: {
  onSend: (text: string, opts?: ComposerOptions) => void;
  pending: boolean;
}) {
  const [value, setValue] = useState("");
  const [depth, setDepth] = useState<ReasoningDepth>("mid");
  const [files, setFiles] = useState<string[]>([]);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-resize up to ~5 lines, then scroll internally.
  // biome-ignore lint/correctness/useExhaustiveDependencies: must re-measure scrollHeight whenever the text changes.
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const submit = (raw: string) => {
    const t = raw.trim();
    if (!t || pending) return;
    onSend(t, { depth });
    setValue("");
    setFiles([]);
    // Keep focus so rapid follow-ups don't lose the caret.
    requestAnimationFrame(() => taRef.current?.focus());
  };

  const canSend = value.trim().length > 0 && !pending;

  return (
    <div className="flex flex-col">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="rounded-2xl border bg-card shadow-2xl transition-all focus-within:border-ring/60 focus-within:ring-1 focus-within:ring-ring/30"
      >
        {files.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 px-3 pt-3">
            {files.map((name) => (
              <span
                key={name}
                className="flex max-w-full items-center gap-1.5 rounded-full bg-muted py-1 pr-1.5 pl-2.5 text-xs"
              >
                <PaperclipIcon className="size-3 shrink-0 opacity-60" />
                <span className="max-w-40 truncate">{name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${name}`}
                  onClick={() =>
                    setFiles((prev) => prev.filter((f) => f !== name))
                  }
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                >
                  <XIcon className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              submit(value);
            }
          }}
          placeholder="Ask about people, projects, decisions…"
          aria-label="Ask the company brain"
          rows={1}
          maxLength={MAX_LENGTH}
          className="max-h-32 min-h-9 w-full resize-none bg-transparent px-3 pt-3 text-sm outline-none placeholder:text-muted-foreground"
        />

        <div className="flex flex-wrap items-center gap-1 px-2 pt-1 pb-2">
          <Popover>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  title="Reasoning depth"
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
                />
              }
            >
              <BrainIcon className="size-3.5 shrink-0 opacity-70" />
              <span className="hidden sm:inline">
                Reasoning: {DEPTHS.find((d) => d.id === depth)?.label}
              </span>
              <span className="sm:hidden">
                {DEPTHS.find((d) => d.id === depth)?.label}
              </span>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-80">
              {DEPTHS.map((d) => {
                const selected = depth === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDepth(d.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                      selected
                        ? "bg-foreground/[0.06] text-foreground"
                        : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block">{d.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {d.hint}
                      </span>
                    </span>
                    {selected ? (
                      <CheckIcon className="size-4 shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>

          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={(e) => {
              const names = [...(e.target.files ?? [])].map((f) => f.name);
              if (names.length > 0) {
                setFiles((prev) => [...prev, ...names].slice(0, 5));
              }
              e.target.value = "";
            }}
          />
          <button
            type="button"
            title="Attach docs"
            aria-label="Attach docs"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <PaperclipIcon className="size-4" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground/70 tabular-nums">
              {value.length}/{MAX_LENGTH}
            </span>
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send"
              title="Send"
              className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/80 disabled:opacity-40 data-[active=true]:shadow-md"
              data-active={canSend}
            >
              <ArrowUpIcon className="size-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
