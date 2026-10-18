"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  TypingText,
  TypingTextCursor,
} from "@/components/animate-ui/primitives/texts/typing";
import ScrollExpand from "@/components/ScrollExpand";
import { heroExpandedStore } from "./hero-expanded-store";

const SCROLL_DISTANCE = 1.2;

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const expanded = useSyncExternalStore(
    heroExpandedStore.subscribe,
    heroExpandedStore.getSnapshot,
    heroExpandedStore.getServerSnapshot,
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const track = section.querySelector<HTMLElement>(".scroll-expand__track");
    if (!track) return;
    let raf = 0;
    const publish = () => {
      raf = 0;
      heroExpandedStore.set(
        track.getBoundingClientRect().top <=
          -(window.innerHeight * SCROLL_DISTANCE) + 1,
      );
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(publish);
    };
    publish();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} className="min-h-screen bg-zinc-950 text-white">
      {/* Editorial grid: pinned to the viewport for the full stage duration,
          releases in lockstep with the media stage at the end of the track.
          NOTE: never give this sticky box a negative bottom margin — sticky
          clamps against its margin box, so the overlay would stay pinned over
          the footer forever. The overlap lives on the media block below. */}
      <div className="pointer-events-none sticky top-0 z-20 h-[100svh]">
        {/* Top-left — mono index */}
        <ul
          className={`absolute top-28 left-8 z-20 space-y-1 font-mono text-[11px] tracking-[0.2em] text-zinc-400 transition-all duration-700 ease-out delay-100 ${
            expanded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <li>/ AI KNOWLEDGE GRAPH</li>
          <li>/ FALKORDB INTEGRATION</li>
          <li>/ REFLEXION AUDITING</li>
        </ul>

        {/* Top-right — narrative */}
        <p
          className={`absolute top-28 right-8 z-20 max-w-sm text-right text-sm font-sans leading-relaxed tracking-tight text-zinc-300 transition-all delay-200 duration-700 ease-out ${
            expanded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          The AI knowledge graph your team can actually ask questions to. Clean,
          verifiable proof behind every answer.
        </p>

        {/* Bottom-left — headline */}
        <div
          className={`absolute bottom-12 left-8 z-20 max-w-xl transition-all delay-300 duration-700 ease-out ${
            expanded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <span className="mb-3 inline-block rounded border border-zinc-800/80 bg-zinc-900/80 px-2.5 py-1 font-mono text-[10px] tracking-[0.25em] text-zinc-400 uppercase">
            [ ENTERPRISE KNOWLEDGE GRAPH ]
          </span>
          <h1 className="text-5xl font-bold leading-[0.95] tracking-tight text-white lg:text-7xl">
            Clear. Precise.
            <br />
            Audited.
          </h1>
        </div>

        {/* Bottom-right — glass CTA card */}
        <div
          className={`absolute bottom-12 right-8 z-20 flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-2xl backdrop-blur-md transition-all delay-500 duration-700 ease-out ${
            expanded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <div>
            <p className="text-sm font-medium text-white">Explore Workspace</p>
            <p className="text-xs text-zinc-400">Ask Company Brain</p>
          </div>
          <Link
            href="/chat"
            className={`${expanded ? "pointer-events-auto" : "pointer-events-none"} flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-medium text-black transition-colors hover:bg-zinc-200`}
          >
            Open
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <ScrollExpand
        src="/Hands_upscaled.jpeg"
        alt="Hands reaching upward toward light"
        title={
          <TypingText
            text="Built to Connect"
            delay={600}
            duration={60}
            className="drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]"
          >
            <TypingTextCursor
              style={{
                height: "0.85em",
                width: "3px",
                transform: "translateY(0.08em)",
                marginLeft: "0.08em",
              }}
            />
          </TypingText>
        }
        className="-mt-[100svh] z-0"
        scrollHint="Scroll to explore"
        titleFadeStart={0.32}
        titleFadeEnd={0.8}
        startWidth={0}
        startHeight={0}
        scrollDistance={SCROLL_DISTANCE}
        useWindowScroll
      />
    </section>
  );
}
