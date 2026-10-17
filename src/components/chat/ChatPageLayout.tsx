"use client";

import { useState } from "react";
import {
  WorkspaceRail,
  type WorkspaceView,
} from "@/components/sidebars-workspace-rail";
import {
  mergeSources,
  RECENT_SESSIONS,
  type RecentSession,
  type SessionSource,
  type SessionStatus,
} from "@/lib/mock/sessions";
import { ChatShell } from "./ChatShell";
import { GraphPanel, ProofsPanel, TeamPanel } from "./WorkspaceViews";

function titleFromPrompt(text: string): string {
  const words = text.trim().split(/\s+/).slice(0, 5).join(" ");
  const truncated = words.length > 42 ? `${words.slice(0, 42)}…` : words;
  return truncated || "Untitled chat";
}

export function ChatPageLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState<WorkspaceView>("chat");
  const [sessions, setSessions] = useState<RecentSession[]>(RECENT_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [threadKey, setThreadKey] = useState(0);

  const openSidebar = () => setMobileOpen(true);
  const closeSidebar = () => setMobileOpen(false);

  const handleNewChat = () => {
    // Remount ChatShell for a fresh agent thread, then return to chat.
    setActiveSessionId(null);
    setThreadKey((k) => k + 1);
    setActiveView("chat");
  };

  const handleSelectSession = (id: string) => {
    // Remount ChatShell so the saved thread (or live replay) loads fresh.
    setActiveSessionId(id);
    setThreadKey((k) => k + 1);
    setActiveView("chat");
  };

  const handlePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s)),
    );
  };

  const handleRenameSession = (id: string, title: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      // Deleting the active chat gracefully lands back in a New Chat state.
      setActiveSessionId(null);
      setThreadKey((k) => k + 1);
      setActiveView("chat");
    }
  };

  const handleThreadStarted = (text: string): string | null => {
    const id = `s-${Date.now()}`;
    const session: RecentSession = {
      id,
      title: titleFromPrompt(text),
      query: text,
      status: "processing",
      updatedAt: new Date().toISOString(),
    };
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(id);
    return id;
  };

  const handleThreadResolved = (
    id: string | null,
    status: SessionStatus,
    newSources?: SessionSource[],
  ) => {
    if (!id) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              // Attach retrieved evidence so re-selecting this chat reloads it.
              ...(newSources?.length
                ? { sources: mergeSources(s.sources ?? [], newSources) }
                : {}),
            }
          : s,
      ),
    );
  };

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <WorkspaceRail
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={closeSidebar}
        activeView={activeView}
        onSelectView={setActiveView}
        onNewChat={handleNewChat}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onPinSession={handlePinSession}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
      />
      <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {activeView === "chat" ? (
          <ChatShell
            key={threadKey}
            onOpenSidebar={openSidebar}
            sessionId={activeSessionId}
            session={sessions.find((s) => s.id === activeSessionId) ?? null}
            onThreadStarted={handleThreadStarted}
            onThreadResolved={handleThreadResolved}
          />
        ) : activeView === "graph" ? (
          <GraphPanel onOpenSidebar={openSidebar} />
        ) : activeView === "proofs" ? (
          <ProofsPanel onOpenSidebar={openSidebar} />
        ) : (
          <TeamPanel onOpenSidebar={openSidebar} />
        )}
      </main>
    </div>
  );
}
