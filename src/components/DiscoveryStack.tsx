"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Heart, RefreshCw, Sparkles, X } from "lucide-react";
import { toast } from "react-hot-toast";

import { reserveItem } from "@/app/actions/exchange";
import { toggleSaveItem } from "@/app/actions/item";
import DiscoveryCard from "@/components/DiscoveryCard";
import FeedbackSheet, { FeedbackType } from "@/components/FeedbackSheet";
import { localizeHref } from "@/lib/i18n/pathnames";
import LiquidButton from "@/components/ui/LiquidButton";

interface Item {
  id: string;
  title: string;
  imageUrl?: string | null;
  creditValue: number;
  locationZone: string;
  owner: {
    username: string;
    trustScore: number;
    completionRate: number;
    avgResponseTime: number;
    avgPhotoQuality: number;
    level: number;
    xp: number;
  };
  images?: Array<{ url: string; orderIndex: number }> | null;
}

export default function DiscoveryStack({ items: initialItems }: { items: Item[] }) {
  const [items] = useState(initialItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    metadata?: { amount?: number; currentAmount?: number; exchangeId?: string };
  }>({
    isOpen: false,
    type: "unexpected_error",
  });
  const [toastState, setToastState] = useState<{
    show: boolean;
    text: string;
    type: "RESERVE" | "SAVE";
    exchangeId?: string;
  }>({
    show: false,
    text: "",
    type: "SAVE",
  });

  const locale = useLocale();
  const t = useTranslations("discoverStack");
  const currentItem = items[currentIndex];
  const remaining = Math.max(items.length - currentIndex, 0);

  const handleSwipeRight = async () => {
    if (!currentItem) return;

    try {
      const result = await reserveItem(currentItem.id);
      if (!result.ok) {
        if (result.code === "insufficient_swaps") {
          setFeedback({
            isOpen: true,
            type: "insufficient_swaps",
            metadata: {
              amount: (result.data as any)?.requiredAmount ?? currentItem.creditValue,
              currentAmount: (result.data as any)?.currentAmount ?? 0,
            },
          });
        } else if (result.code === "auth_required") {
          setFeedback({ isOpen: true, type: "auth_required" });
        } else if (result.code === "own_item_forbidden") {
          setFeedback({ isOpen: true, type: "own_item_forbidden" });
        } else {
          setFeedback({ isOpen: true, type: "unexpected_error" });
        }
        return;
      }

      setFeedback({
        isOpen: true,
        type: "exchange_reserved",
        metadata: { exchangeId: result.data?.exchangeId },
      });
    } catch {
      setFeedback({ isOpen: true, type: "unexpected_error" });
    }
  };

  const handleSave = async () => {
    if (!currentItem) return;

    try {
      const { saved } = await toggleSaveItem(currentItem.id);
      setToastState({
        show: true,
        text: saved ? "Objet ajouté aux favoris ❤️" : "Retiré des favoris",
        type: "SAVE",
      });
      window.setTimeout(() => setToastState((prev) => ({ ...prev, show: false })), 1800);
    } catch {
      toast.error(t("saveError"));
    }
  };

  const handleSwipeLeft = () => setCurrentIndex((prev) => prev + 1);

  if (currentIndex >= items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-full w-full flex-col items-center justify-center p-6 text-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-cta animate-bounce">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="font-display text-2xl font-black tracking-tight text-foreground">
          {t("emptyTitle") || "Tu as tout vu ! 🎉"}
        </h2>
        <p className="mt-1.5 text-xs font-semibold leading-relaxed text-muted max-w-xs">
          {t("emptyBody") || "Reviens plus tard pour découvrir les nouvelles pépites déposées."}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setCurrentIndex(0)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-4 py-2.5 text-xs font-black text-foreground shadow-sm active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Recommencer 🔄
          </button>
          <Link href={localizeHref(locale, "/")}>
            <LiquidButton variant="primary" size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500">
              {t("backHome") || "Accueil"}
            </LiquidButton>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-between overflow-hidden">
      {/* Top Deck Counter Pill */}
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
          <span className="font-display text-base text-emerald-500">
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-[10px] text-muted">/ {String(items.length).padStart(2, "0")}</span>
        </div>

        <div className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[8px] font-black uppercase text-purple-600 dark:text-purple-300">
          {remaining} restants ⚡
        </div>
      </div>

      {/* Main Swiper Stage - Strictly flex-1 min-h-0 fills exactly the space */}
      <div className="relative flex-1 min-h-0 w-full mb-3">
        <AnimatePresence>
          {items
            .slice(currentIndex, currentIndex + 2)
            .reverse()
            .map((item, index, arr) => {
              const isFront = index === arr.length - 1;
              return (
                <DiscoveryCard
                  key={item.id}
                  item={item}
                  isFront={isFront}
                  onSwipeRight={handleSwipeRight}
                  onSwipeLeft={handleSwipeLeft}
                />
              );
            })}
        </AnimatePresence>
      </div>

      {/* Action Buttons Cockpit */}
      <div className="relative z-30 mx-auto flex w-full max-w-[17rem] items-center justify-center gap-4 py-1">
        {/* Pass Button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: -6 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSwipeLeft}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-300 bg-surface text-rose-500 shadow-md hover:bg-rose-500 hover:text-white transition-colors"
          aria-label={t("skip")}
        >
          <X className="h-5 w-5" strokeWidth={3} />
        </motion.button>

        {/* Save / Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.12, rotate: 6 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSave}
          className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-tr from-amber-400 to-amber-500 text-white shadow-md active:scale-95"
          aria-label={t("save")}
        >
          <Heart className="h-6 w-6 fill-white" />
        </motion.button>

        {/* Reserve / Swap Button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 6 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSwipeRight}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300 bg-surface text-emerald-500 shadow-md hover:bg-emerald-500 hover:text-white transition-colors"
          aria-label={t("reserve")}
        >
          <Sparkles className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Toast popup */}
      <AnimatePresence>
        {toastState.show && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="pointer-events-none absolute inset-x-4 bottom-24 z-[60] flex justify-center"
          >
            <div className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-xl">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-foreground">{toastState.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FeedbackSheet
        isOpen={feedback.isOpen}
        onClose={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
        type={feedback.type}
        metadata={feedback.metadata}
      />
    </div>
  );
}
