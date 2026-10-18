"use client";

import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { heroExpandedStore } from "./hero-expanded-store";

const NAV_ITEMS = [
  { label: "FEATURES", href: "#features", id: "features" },
  { label: "GRAPH ENGINE", href: "#graph-engine", id: "graph-engine" },
  { label: "PROOF INSPECTOR", href: "#proof-inspector", id: "proof-inspector" },
  { label: "DOCS", href: "#docs", id: "docs" },
] as const;

export function Header() {
  const [active, setActive] = useState<string | null>(null);
  const expanded = useSyncExternalStore(
    heroExpandedStore.subscribe,
    heroExpandedStore.getSnapshot,
    () => false,
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (const item of NAV_ITEMS) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(item.id);
        },
        { rootMargin: "-40% 0px -55% 0px" },
      );
      observer.observe(el);
      observers.push(observer);
    }
    return () => {
      for (const o of observers) o.disconnect();
    };
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 flex w-full items-center justify-between bg-transparent px-8 py-6 transition-[opacity,transform] duration-500 ease-out ${
        expanded
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      {/* Brand */}
      <div className="pr-8">
        <Link
          href="/"
          className="text-xs font-medium tracking-[0.2em] text-zinc-200 uppercase transition-colors hover:text-white"
        >
          SCRIZO
        </Link>
      </div>

      {/* Navigation */}
      <nav className="hidden items-center border-l border-zinc-800/40 pl-8 md:flex">
        {NAV_ITEMS.map((item, i) => (
          <div key={item.id} className="relative flex items-center">
            {i > 0 && (
              <span
                className="mx-6 h-3 w-px bg-zinc-800/40"
                aria-hidden="true"
              />
            )}
            <a
              href={item.href}
              className={`relative py-1 font-mono text-[10px] tracking-[0.25em] transition-colors uppercase ${
                active === item.id
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {item.label}
              <span
                aria-hidden="true"
                className={`absolute -bottom-0.5 left-0 h-px bg-indigo-500 transition-all duration-300 ${
                  active === item.id ? "w-full" : "w-0"
                }`}
              />
            </a>
          </div>
        ))}
      </nav>

      {/* Action */}
      <div className="flex items-center border-l border-zinc-800/40 pl-8">
        <Link
          href="/chat"
          aria-label="Launch app"
          className="group flex items-center gap-3 text-zinc-400 transition-colors hover:text-white"
        >
          <span className="hidden font-mono text-[10px] tracking-[0.25em] uppercase sm:inline">
            Launch App
          </span>
          <LayoutGrid className="size-3.5 group-hover:stroke-white" />
        </Link>
      </div>
    </header>
  );
}
