"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Compass, MapPin, Sparkles, RefreshCw, Package } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { localizeHref } from "@/lib/i18n/pathnames";

interface RealItemNode {
  id: string;
  title: string;
  creditValue: number;
  images?: Array<{ url: string }> | null;
  locationZone?: string;
}

interface LiveSwapRadarProps {
  userZone?: string;
  items?: RealItemNode[];
}

export default function LiveSwapRadar({ userZone = "Lomé Centre", items = [] }: LiveSwapRadarProps) {
  const locale = useLocale();
  const [pulseKey, setPulseKey] = useState(0);

  // Position coordinates for up to 4 real items in the radar ring
  const positions = [
    { x: "18%", y: "22%" },
    { x: "80%", y: "24%" },
    { x: "20%", y: "76%" },
    { x: "78%", y: "74%" },
  ];

  const activeNodes = items.slice(0, 4).map((item, idx) => ({
    ...item,
    pos: positions[idx] || { x: "50%", y: "20%" },
  }));

  return (
    <div className="relative overflow-hidden rounded-[38px] border-2 border-border bg-gradient-to-b from-surface via-surface to-emerald-500/10 p-6 shadow-2xl backdrop-blur-2xl">
      {/* Background Radar Rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 rounded-full border border-emerald-500/15 animate-ping opacity-25" />
        <div className="absolute h-48 w-48 rounded-full border border-teal-500/20 opacity-40" />
        <div className="absolute h-32 w-32 rounded-full border border-purple-500/25 opacity-50" />
        <div className="absolute h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-500 to-purple-600 opacity-20 blur-xl" />
      </div>

      {/* Header Info */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Radar Temps Réel
          </span>
        </div>

        <button
          onClick={() => setPulseKey((prev) => prev + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm hover:text-foreground active:rotate-180 transition-transform"
          aria-label="Scanner"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Central Radar Stage with REAL Items from DB */}
      <div className="relative z-10 my-4 h-48 w-full select-none">
        {/* Center Orb (The User Zone) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-tr from-emerald-400 via-teal-500 to-purple-600 p-1 shadow-cta"
          >
            <div className="flex h-full w-full items-center justify-center rounded-[20px] bg-surface text-2xl">
              ⚡
            </div>
          </motion.div>
          <span className="mt-1 text-[9px] font-black uppercase tracking-widest text-foreground">
            {userZone}
          </span>
        </div>

        {/* Real Item Nodes */}
        {activeNodes.map((node, i) => {
          const img = node.images?.[0]?.url;
          return (
            <Link
              key={`${node.id}-${pulseKey}`}
              href={localizeHref(locale, `/item/${node.id}`)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
              style={{ left: node.pos.x, top: node.pos.y }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -5, 0] }}
                transition={{
                  scale: { delay: i * 0.15, type: "spring", stiffness: 400 },
                  y: { duration: 2.5 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
                }}
                className="flex items-center gap-2 rounded-2xl border border-border bg-surface/95 p-1.5 pr-3 shadow-md backdrop-blur-xl group-hover:border-emerald-500 transition-colors"
              >
                <div className="h-8 w-8 rounded-xl overflow-hidden bg-background shrink-0 flex items-center justify-center">
                  {img ? (
                    <img src={img} alt={node.title} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-4 w-4 text-muted" />
                  )}
                </div>
                <div className="flex flex-col min-w-0 max-w-[85px]">
                  <span className="text-[9px] font-bold text-foreground leading-tight truncate">
                    {node.title}
                  </span>
                  <span className="text-[8px] font-black text-emerald-500 leading-tight">
                    {node.creditValue} SC
                  </span>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Slogan Banner */}
      <div className="relative z-10 text-center space-y-1.5 mb-4">
        <h2 className="font-display text-2xl font-black tracking-tight text-foreground">
          Trouve ton swap en 1 clic 🎯
        </h2>
        <p className="text-xs font-semibold text-muted max-w-xs mx-auto">
          Des objets réels prêts à être échangés autour de toi sans jamais payer en espèces.
        </p>
      </div>

      {/* Big Action Button */}
      <div className="relative z-10 flex gap-2.5">
        <Link href={localizeHref(locale, "/discover")} className="flex-1">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-purple-600 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-cta hover:brightness-105 transition-all"
          >
            <Compass className="h-4.5 w-4.5" />
            <span>Lancer la Recherche au Swipe 🚀</span>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
