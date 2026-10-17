// biome-ignore-all lint/suspicious/noArrayIndexKey: keys index into static parsed message text whose order never changes.
"use client";

import { Bot, RotateCcwIcon, User } from "lucide-react";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/copy-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ChatMessageModel, NodeId } from "@/lib/mock/types";
import { GuardCardsInline } from "./GuardCardsInline";
import { ReflexionMarkers } from "./ReflexionMarkers";

function CitationButton({
  index,
  onSelect,
}: {
  index: string;
  onSelect: (nodeId: NodeId) => void;
}) {
  return (
    <button
      key={`c-${index}`}
      type="button"
      data-citation={index}
      onClick={() => onSelect(`cite:${index}`)}
      className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
    >
      [{index}]
    </button>
  );
}

function renderInline(
  text: string,
  keyPrefix: string,
  onSelect: (nodeId: NodeId) => void,
): ReactNode[] {
  // Citations first, then lightweight markdown (bold + inline code).
  const cited = text.split(/(\[\d+\])/g);
  return cited.map((part, i) => {
    const m = part.match(/\[(\d+)\]/);
    if (m)
      return (
        <CitationButton
          key={`${keyPrefix}-c-${i}`}
          index={m[1]}
          onSelect={onSelect}
        />
      );
    const styled = part.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
      <span key={`${keyPrefix}-t-${i}`}>
        {styled.map((chunk, j) => {
          if (
            chunk.startsWith("**") &&
            chunk.endsWith("**") &&
            chunk.length > 4
          ) {
            return <strong key={j}>{chunk.slice(2, -2)}</strong>;
          }
          if (
            chunk.startsWith("`") &&
            chunk.endsWith("`") &&
            chunk.length > 2
          ) {
            return (
              <code key={j} className="rounded bg-muted px-1 font-mono text-xs">
                {chunk.slice(1, -1)}
              </code>
            );
          }
          return <span key={j}>{chunk}</span>;
        })}
      </span>
    );
  });
}

function renderRichText(
  text: string,
  onSelect: (nodeId: NodeId) => void,
): ReactNode[] {
  // Fenced code blocks render via CodeBlock; everything else is prose.
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return blocks.map((block, bi) => {
    const fence = block.match(/^```(\w*)\n([\s\S]*?)```$/);
    if (fence) {
      return (
        <CodeBlock key={`code-${bi}`} className="my-1">
          <CodeBlockHeader>
            <CodeBlockTitle>{fence[1] || "code"}</CodeBlockTitle>
          </CodeBlockHeader>
          <CodeBlockContent>{fence[2].replace(/\n$/, "")}</CodeBlockContent>
        </CodeBlock>
      );
    }
    return (
      <span key={`prose-${bi}`} className="whitespace-pre-wrap">
        {renderInline(block, `b${bi}`, onSelect)}
      </span>
    );
  });
}

export function ThreadMessage({
  message,
  onSelectNode,
  onRetry,
}: {
  message: ChatMessageModel;
  onSelectNode: (nodeId: NodeId) => void;
  onRetry?: () => void;
}) {
  const isUser = message.role === "user";
  const citationByIndex = new Map(
    (message.citations ?? []).map((c) => [String(c.index), c.nodeId]),
  );

  const handleCitation = (raw: NodeId) => {
    if (raw.startsWith("cite:")) {
      const idx = raw.slice(5);
      const nodeId = citationByIndex.get(idx);
      if (nodeId) onSelectNode(nodeId);
      return;
    }
    onSelectNode(raw);
  };

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageAvatar>
        <Avatar className="size-8">
          <AvatarFallback>
            {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
          </AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        {message.steps && message.steps.length > 0 && !isUser ? (
          <ReflexionMarkers
            steps={message.steps}
            pending={message.pending}
            reasoningSec={message.reasoningSec}
          />
        ) : null}
        <Bubble
          variant={isUser ? "muted" : "secondary"}
          align={isUser ? "end" : "start"}
        >
          <BubbleContent>
            {message.pending ? (
              <span className="shimmer text-sm text-muted-foreground">
                Thinking…
              </span>
            ) : (
              <span className="text-sm leading-relaxed">
                {renderRichText(message.text, handleCitation)}
              </span>
            )}
          </BubbleContent>
        </Bubble>
        {!isUser && (
          <GuardCardsInline message={message} onSelectNode={onSelectNode} />
        )}
      </MessageContent>
      {!isUser && !message.pending ? (
        <MessageFooter>
          <Tooltip>
            <TooltipTrigger
              render={
                <CopyButton
                  text={message.text}
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground"
                />
              }
            />
            <TooltipContent>Copy</TooltipContent>
          </Tooltip>
          {onRetry ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={onRetry}
                    aria-label="Retry answer"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  />
                }
              >
                <RotateCcwIcon className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>Retry</TooltipContent>
            </Tooltip>
          ) : null}
        </MessageFooter>
      ) : null}
    </Message>
  );
}
