import type { ReactNode } from "react";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-svh flex-col">{children}</div>;
}
