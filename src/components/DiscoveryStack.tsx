"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, MessageSquare, RefreshCw, Star, X } from "lucide-react";
import { toast } from "react-hot-toast";

import { reserveItem } from "@/app/actions/exchange";
import { toggleSaveItem } from "@/app/actions/item";
import DiscoveryCard from "@/components/DiscoveryCard";
import FeedbackSheet, { FeedbackType } from "@/components/FeedbackSheet";
import { localizeHref } from "@/lib/i18n/pathnames";

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
    if (!currentItem) {
      return;
    }

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
    if (!currentItem) {
      return;
    }

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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center px-8 text-center"
      >
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <RefreshCw className="h-7 w-7 text-slate-500" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{t("emptyTitle")}</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{t("emptyBody")}</p>
        <Link
          href={localizeHref(locale, "/")}
          className="mt-8 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {t("backHome")}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden pb-4">
      <div className="mb-3 overflow-hidden rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,251,246,0.86))] px-4 py-3 shadow-[0_14px_32px_rgba(16,32,58,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted/70">{t("title")}</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="font-display text-[1.65rem] font-bold leading-none tracking-[-0.05em] text-foreground">
                {String(currentIndex + 1).padStart(2, "0")}
              </span>
              <span className="pb-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted/70">
                / {String(items.length).padStart(2, "0")}
              </span>
            </div>
          </div>
          <div className="rounded-full border border-[#dfe8ff] bg-[#eef4ff] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            {remaining} {t("items")}
          </div>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#10203a,#2457ff,#7ebdff)]"
            initial={false}
            animate={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
          />
        </div>
      </div>

      <div className="relative mb-4 flex-1 min-h-[30rem]">
        <div className="pointer-events-none absolute inset-x-4 top-4 bottom-4 rounded-[42px] bg-[#dfe8ff]/40 blur-3xl" />
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

      <div className="relative z-50 mx-auto flex w-full max-w-[17rem] items-center justify-center gap-4 rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,252,247,0.84))] px-4 py-2.5 shadow-[0_20px_44px_rgba(16,32,58,0.1)] backdrop-blur-md">
        <button
          onClick={handleSwipeLeft}
          className="group flex h-12 w-12 items-center justify-center rounded-[20px] border border-white/80 bg-white text-muted shadow-sm transition-all active:scale-95 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500"
          aria-label={t("skip")}
        >
          <X className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
        </button>

        <button
          onClick={handleSave}
          className="group flex h-[3.8rem] w-[3.8rem] items-center justify-center rounded-[1.7rem] bg-[linear-gradient(145deg,#10203a,#2457ff)] text-white shadow-[0_20px_40px_rgba(16,32,58,0.22)] transition-all active:scale-95 hover:brightness-105"
          aria-label={t("save")}
        >
          <Star className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
        </button>

        <button
          onClick={handleSwipeRight}
          className="group flex h-12 w-12 items-center justify-center rounded-[20px] border border-white/80 bg-white text-muted shadow-sm transition-all active:scale-95 hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-500"
          aria-label={t("reserve")}
        >
          <MessageSquare className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        </button>
      </div>

      <AnimatePresence>
        {toastState.show ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="pointer-events-none absolute inset-x-4 bottom-28 z-[60] flex justify-center"
          >
            <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-popup">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{toastState.text}</span>
                {toastState.type === "RESERVE" && toastState.exchangeId ? (
                  <Link
                    href={localizeHref(locale, `/exchange/${toastState.exchangeId}`)}
                    className="mt-0.5 text-xs font-semibold text-primary hover:underline underline-offset-2"
                  >
                    {t("goToChat")}
                  </Link>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
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
