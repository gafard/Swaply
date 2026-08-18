"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Flame, Zap, Crown, Gift, Plus } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { localizeHref } from "@/lib/i18n/pathnames";

interface StoryItem {
  id: string;
  title: string;
  emoji: string;
  gradient: string;
  isSpecial?: boolean;
  tag?: string;
}

const STORIES: StoryItem[] = [
  {
    id: "drop",
    title: "Drops Flash",
    emoji: "🔥",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    tag: "LIVE",
  },
  {
    id: "bonus",
    title: "+60 Swaps",
    emoji: "🎁",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    isSpecial: true,
    tag: "CADEAU",
  },
  {
    id: "tech",
    title: "Tech & Geek",
    emoji: "📱",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
  },
  {
    id: "sneakers",
    title: "Streetwear",
    emoji: "👟",
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
  },
  {
    id: "vip",
    title: "Top Troqueurs",
    emoji: "👑",
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    tag: "PRO",
  },
];

export default function StoriesBar() {
  const locale = useLocale();

  return (
    <div className="relative -mx-4 px-4 overflow-x-auto no-scrollbar py-1 select-none">
      <div className="flex items-center gap-3.5 min-w-max">
        {/* Story "+ Créer" Button */}
        <Link href={localizeHref(locale, "/publish")} className="group flex flex-col items-center gap-1.5">
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="relative flex h-16 w-16 items-center justify-center rounded-[24px] border-2 border-dashed border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 shadow-sm transition-colors group-hover:border-emerald-500"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-cta">
              <Plus className="h-4 w-4" strokeWidth={3} />
            </div>
          </motion.div>
          <span className="text-[10px] font-black tracking-tight text-foreground">
            Déposer
          </span>
        </Link>

        {/* Stories Items */}
        {STORIES.map((story, i) => (
          <Link
            key={story.id}
            href={`${localizeHref(locale, "/discover")}?story=${story.id}`}
            className="group flex flex-col items-center gap-1.5"
          >
            <motion.div
              whileHover={{ scale: 1.08, rotate: i % 2 === 0 ? 3 : -3 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              className="relative p-[2.5px] rounded-[24px] bg-gradient-to-tr from-emerald-400 via-teal-500 to-purple-600 shadow-md group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all"
            >
              <div className="flex h-[3.8rem] w-[3.8rem] items-center justify-center rounded-[22px] bg-surface p-1">
                <div className={`flex h-full w-full items-center justify-center rounded-[18px] bg-gradient-to-tr ${story.gradient} text-2xl shadow-inner`}>
                  {story.emoji}
                </div>
              </div>

              {/* Live/Special Badge */}
              {story.tag && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-rose-500 px-1.5 py-0.2 text-[7px] font-black uppercase tracking-wider text-white shadow-sm ring-2 ring-surface">
                  {story.tag}
                </span>
              )}
            </motion.div>

            <span className="text-[10px] font-black tracking-tight text-foreground group-hover:text-emerald-500 transition-colors">
              {story.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
