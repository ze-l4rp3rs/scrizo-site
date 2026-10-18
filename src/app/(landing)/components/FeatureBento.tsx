"use client";

import { motion } from "framer-motion";
import {
  FileText,
  type LucideIcon,
  Network,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import HalftoneReveal from "@/components/HalftoneReveal";

type FeatureCard = {
  step: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: LucideIcon;
};

const CARDS: FeatureCard[] = [
  {
    step: "01",
    title: "Knowledge Graph Engine",
    subtitle:
      "FalkorDB backboned real-time entity mapping across people, projects & decisions.",
    tag: "falkordb · live mapping",
    icon: Network,
  },
  {
    step: "02",
    title: "Self-Correcting Audit",
    subtitle:
      "Every reply runs a reflexion loop: claim extraction, source fetch, verdict.",
    tag: "reflect → revise → approve",
    icon: RefreshCcw,
  },
  {
    step: "03",
    title: "Verifiable Citation Trails",
    subtitle: "Claims resolve to clickable sources, never to vibes.",
    tag: "source · doc · decision",
    icon: FileText,
  },
  {
    step: "04",
    title: "Role-Aware Guardrails",
    subtitle:
      "Restricted data degrades to a soft request card — never a hard error.",
    tag: "rbac · clearance matrix",
    icon: ShieldCheck,
  },
];

function FeatureGlassCard({
  card,
  index,
}: {
  card: FeatureCard;
  index: number;
}) {
  const Icon = card.icon;
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.18] backdrop-blur-2xl p-5 lg:p-6 flex flex-col justify-between transition-all duration-300 hover:bg-white/[0.05] min-h-[190px]"
    >
      {/* soft top-left glass sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -left-10 size-32 rounded-full bg-white/[0.06] blur-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
      />

      {/* subtle bottom vignette for text legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent"
      />

      {/* top: whisper icon + step */}
      <div className="relative flex items-start justify-between">
        <Icon
          className="size-4 text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300"
          strokeWidth={1.5}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600 group-hover:text-zinc-400 transition-colors duration-300">
          {card.step}
        </span>
      </div>

      {/* middle content */}
      <div className="relative">
        <h3 className="font-sans text-lg font-normal tracking-tight text-zinc-200 group-hover:text-white transition-colors duration-300">
          {card.title}
        </h3>
        <p className="font-sans text-xs text-zinc-500 font-normal leading-relaxed tracking-normal mt-1.5 group-hover:text-zinc-400 transition-colors duration-300">
          {card.subtitle}
        </p>
      </div>

      {/* bottom metadata — plain mono caption, no chip */}
      <div className="relative mt-4 flex items-center gap-2">
        <span className="size-1 rounded-full bg-zinc-600 group-hover:bg-zinc-400 transition-colors duration-300" />
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500">
          {card.tag}
        </span>
      </div>
    </motion.article>
  );
}

export function FeatureBento() {
  return (
    <section className="relative w-full min-h-screen py-0 px-6 lg:px-8 bg-zinc-950 text-white font-sans flex items-stretch overflow-hidden">
      {/* moody feature background — dark monochrome flower field */}
      <Image
        src="/feature background.jpg"
        alt=""
        fill
        priority
        aria-hidden="true"
        sizes="100vw"
        className="absolute inset-0 z-0 object-cover object-center opacity-55 pointer-events-none select-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/85 via-zinc-950/40 to-zinc-950/75"
      />
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 w-full max-w-[1400px] mx-auto items-stretch">
        {/* Left — dominant artwork column, full-bleed to section edges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 relative min-h-[560px] flex items-center justify-center"
        >
          {/* artwork as seamless halftone background layer of the column */}
          <div className="absolute inset-0 z-0">
            <HalftoneReveal
              src="/girl with mask.png"
              fit="contain"
              mode="mono"
              shape="dot"
              cellSize={7}
              angle={45}
              dotScale={1}
              inkColor="#ffffff"
              paperColor="#09090b"
              accentColor="#a1a1aa"
              contrast={1.15}
              brightness={0}
              roughness={0.15}
              revealRadius={170}
              softness={0.6}
              linger={1.2}
              clickBurst
              intro
              className="w-full h-full object-contain object-center scale-100"
            />
          </div>

          {/* heading pinned to the very top of the section */}
          <div className="absolute top-6 lg:top-8 left-0 z-20">
            <h2 className="font-mono font-bold uppercase text-white text-4xl lg:text-6xl tracking-[0.12em] drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)]">
              [ BRAIN
              <span className="align-super text-lg lg:text-2xl">®</span> ]
            </h2>
          </div>

          {/* narrative pinned to the very bottom of the section */}
          <div className="absolute bottom-6 lg:bottom-8 left-0 z-20 max-w-[300px]">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-zinc-300 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              An enterprise knowledge engine. Every answer audited, cited, and
              time-aware — proof you can click, never a guess.
            </p>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-500 mt-3 inline-block drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              ©2026 — VERIFIED PROOF ENGINE
            </span>
          </div>
        </motion.div>

        {/* Right — tactile glassmorphic feature tiles */}
        <div className="lg:col-span-5 w-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
          >
            {CARDS.map((card, index) => (
              <FeatureGlassCard key={card.step} card={card} index={index} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
