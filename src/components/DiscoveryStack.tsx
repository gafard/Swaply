"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Heart, RefreshCw, Sparkles, X, Zap } from "lucide-react";
import { toast } from "react-hot-toast";

import { reserveItem } from "@/app/actions/exchange";
import { toggleSaveItem } from "@/app/actions/item";
import DiscoveryCard from "@/components/DiscoveryCard";
import FeedbackSheet, { FeedbackType } from "@/components/FeedbackSheet";
import { localizeHref } from "@/lib/i18n/pathnames";
import LiquidButton from "@/components/ui/LiquidButton";
import HoloBadge from "@/components/ui/HoloBadge";

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
      setToastState({ show: true, text: saved ? t("saved") : t("unsaved"), type: "SAVE" });
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
        className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 text-primary shadow-glow">
          <Sparkles className="h-10 w-10" />
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
          {t("emptyTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted max-w-xs">
          {t("emptyBody")}
        </p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => setCurrentIndex(0)}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-bold text-foreground shadow-sm hover:border-primary/40 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Recommencer
          </button>
          <Link href={localizeHref(locale, "/")}>
            <LiquidButton variant="primary" size="md">
              {t("backHome")}
            </LiquidButton>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden pb-4 px-2">
      {/* Top Deck Header with Segmented Counter */}
      <div className="mb-3 flex items-center justify-between rounded-[24px] border border-border bg-surface/85 px-4 py-3 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-[9px] font-black uppercase tracking-widest text-muted">
              {t("title")}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-lg font-bold text-foreground">
                {String(currentIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-xs font-bold text-muted">
                / {String(items.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        <HoloBadge variant="primary" size="sm">
          {remaining} {t("items")}
        </HoloBadge>
      </div>

      {/* Main Swiper Stage */}
      <div className="relative mb-4 flex-1 min-h-[32rem]">
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

      {/* Floating Action Cockpit */}
      <div className="relative z-50 mx-auto flex w-full max-w-[19rem] items-center justify-center gap-4 rounded-[32px] border border-border bg-surface/90 px-5 py-3 shadow-lg backdrop-blur-2xl">
        {/* Pass Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleSwipeLeft}
          className="flex h-13 w-13 items-center justify-center rounded-2xl border border-border bg-surface text-muted shadow-sm hover:border-danger/30 hover:bg-danger/10 hover:text-danger transition-colors"
          aria-label={t("skip")}
        >
          <X className="h-6 w-6" strokeWidth={2.5} />
        </motion.button>

        {/* Save / Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleSave}
          className="flex h-15 w-15 items-center justify-center rounded-[22px] bg-gradient-to-tr from-amber-400 to-amber-600 text-white shadow-md active:scale-95"
          aria-label={t("save")}
        >
          <Heart className="h-7 w-7 fill-white" />
        </motion.button>

        {/* Reserve / Swap Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleSwipeRight}
          className="flex h-13 w-13 items-center justify-center rounded-2xl border border-border bg-surface text-muted shadow-sm hover:border-success/30 hover:bg-success/10 hover:text-success transition-colors"
          aria-label={t("reserve")}
        >
          <Sparkles className="h-6 w-6 text-success" />
        </motion.button>
      </div>

      {/* Toast popup */}
      <AnimatePresence>
        {toastState.show && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="pointer-events-none absolute inset-x-4 bottom-28 z-[60] flex justify-center"
          >
            <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{toastState.text}</span>
                {toastState.type === "RESERVE" && toastState.exchangeId && (
                  <Link
                    href={localizeHref(locale, `/exchange/${toastState.exchangeId}`)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {t("goToChat")} &rarr;
                  </Link>
                )}
              </div>
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
