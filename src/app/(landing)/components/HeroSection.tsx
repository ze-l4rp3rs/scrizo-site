"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ScrollExpand from "@/components/ScrollExpand";

export function HeroSection() {
  return (
    <section className="min-h-screen bg-zinc-950 text-white">
      <ScrollExpand
        src="/Hands_upscaled.jpeg"
        alt="Hands reaching upward toward light"
        title="Built to Connect"
        scrollHint="Scroll to explore"
        startWidth={10}
        startHeight={10}
        useWindowScroll
      >
        <div className="flex max-w-xl flex-col items-center gap-4">
          <p className="font-mono text-[10px] tracking-[0.3em] text-indigo-200/80 uppercase">
            People · Teams · Projects · Documents · Decisions
          </p>
          <p className="text-lg leading-relaxed text-zinc-100/90">
            One knowledge graph your team can actually ask questions — with
            clickable proof behind every answer.
          </p>
          <Link
            href="/chat"
            className="group mt-2 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
          >
            Try it live
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </ScrollExpand>
    </section>
  );
}
