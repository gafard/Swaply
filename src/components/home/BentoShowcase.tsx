"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Flame, Star, Sparkles, MapPin, ArrowRight, Zap, Trophy, ShieldCheck } from "lucide-react";
import { localizeHref } from "@/lib/i18n/pathnames";
import ItemCard from "@/components/ItemCard";
import SpotlightCard from "@/components/ui/SpotlightCard";
import NumberTicker from "@/components/ui/NumberTicker";

interface BentoShowcaseProps {
  nearby: any[];
  popular: any[];
  deals: any[];
}

export default function BentoShowcase({ nearby, popular, deals }: BentoShowcaseProps) {
  const locale = useLocale();
  const featuredItem = popular[0] || nearby[0];
  const secondaryItems = (popular.length > 1 ? popular.slice(1, 3) : nearby.slice(0, 2));

  return (
    <div className="space-y-6">
      {/* 👑 BENTO HERO GRID (1 Big Featured + 2 Small Power Tiles) */}
      {featuredItem && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Big Featured Tile */}
          <Link
            href={localizeHref(locale, `/item/${featuredItem.id}`)}
            className="group relative overflow-hidden rounded-[34px] border-2 border-border bg-surface p-4 shadow-lg transition-all hover:border-emerald-500/50 hover:shadow-xl sm:col-span-1"
          >
            {/* Ambient Corner Flare */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-emerald-500/25 blur-3xl" />

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[26px] bg-background">
              {featuredItem.images?.[0]?.url ? (
                <img
                  src={featuredItem.images[0].url}
                  alt={featuredItem.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-raised">
                  <Flame className="h-10 w-10 text-emerald-500" />
                </div>
              )}

              {/* Tag Overlays */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-md">
                <span>🔥 DROP DU JOUR</span>
              </div>

              <div className="absolute bottom-3 right-3 rounded-2xl border border-white/25 bg-black/65 px-3 py-1.5 backdrop-blur-md">
                <span className="font-display text-lg font-black text-white">
                  {featuredItem.creditValue} <span className="text-amber-400 text-xs">SC</span>
                </span>
              </div>
            </div>

            <div className="mt-3.5 space-y-1">
              <h3 className="line-clamp-1 font-display text-lg font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                {featuredItem.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{featuredItem.locationZone || "Lomé"}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{featuredItem.owner?.trustScore || 100}% Fiable</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Right Column (2 Mini Bento Blocks) */}
          <div className="flex flex-col gap-3.5">
            {/* Mini Block 1: Security Shield */}
            <div className="flex-1 rounded-[30px] border border-border bg-gradient-to-br from-surface to-emerald-500/10 p-4.5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-cta">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                  ESCROW 100%
                </span>
              </div>

              <div className="mt-2">
                <h4 className="font-display text-base font-bold text-foreground">
                  Échange Garanti Sans Arnaque 🛡️
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  Les Swaps restent sous séquestre jusqu'à la validation du QR code entre vous.
                </p>
              </div>
            </div>

            {/* Mini Block 2: Quick Referral / Bonus */}
            <div className="flex-1 rounded-[30px] border border-border bg-gradient-to-br from-surface to-purple-500/10 p-4.5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-cta">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[8px] font-black uppercase text-purple-600 dark:text-purple-300">
                  BONUS ACTIF
                </span>
              </div>

              <div className="mt-2">
                <h4 className="font-display text-base font-bold text-foreground">
                  Gagne +60 Swaps à chaque objet 🎁
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  Chaque publication valide crédite instantanément ton compte.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 FEED GRILLE AVEC ANIMATIONS POP */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="font-display text-xl font-black text-foreground">
              Tous les Nouveaux Swaps
            </h2>
          </div>

          <Link
            href={localizeHref(locale, "/discover")}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 hover:underline"
          >
            <span>Voir tout</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {nearby.slice(0, 6).map((item, index) => (
            <ItemCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
