"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  MapPin,
  MessageSquare,
  RefreshCw,
  Star,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { reserveItem } from "@/app/actions/exchange";
import { toggleSaveItem } from "@/app/actions/item";
import DiscoveryCard from "@/components/DiscoveryCard";
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
  };
}

export default function DiscoveryStack({
  items: initialItems,
}: {
  items: Item[];
}) {
  const [items] = useState(initialItems);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const handleSwipeRight = async () => {
    if (!currentItem) {
      return;
    }

    try {
      const result = await reserveItem(currentItem.id);
      if (!result.ok || !result.data) {
        toast.error(t("reserveError"));
        return;
      }

      setToastState({
        show: true,
        text: t("reserved"),
        type: "RESERVE",
        exchangeId: result.data.exchangeId,
      });
    } catch {
      toast.error(t("reserveError"));
    }
  };

  const handleSave = async () => {
    if (!currentItem) {
      return;
    }

    try {
      const { saved } = await toggleSaveItem(currentItem.id);
      setToastState({
        show: true,
        text: saved ? t("saved") : t("unsaved"),
        type: "SAVE",
      });

      setTimeout(() => {
        setToastState((prev) => ({ ...prev, show: false }));
      }, 1800);
    } catch {
      toast.error(t("saveError"));
    }
  };

  const handleSwipeLeft = () => {
    setCurrentIndex((prev) => prev + 1);
  };

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

        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t("emptyTitle")}
        </h2>
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
    <div className="mx-auto flex h-full w-full max-w-md flex-col bg-background pb-8 overflow-hidden">
      <div className="relative flex-1 mb-6">
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

      <div className="relative z-50 flex items-center justify-center gap-6 shrink-0 pt-2 bg-background/80 backdrop-blur-md rounded-t-3xl">
        <button
          onClick={handleSwipeLeft}
          className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-muted shadow-sm transition-all active:scale-95 hover:border-rose-100 hover:bg-rose-50 hover:text-danger"
          aria-label={t("skip")}
        >
          <X className="h-5 w-5 transition-transform duration-500 group-hover:rotate-90" />
        </button>

        <button
          onClick={handleSave}
          className="group flex h-[4rem] w-[4rem] items-center justify-center rounded-[2rem] bg-slate-950 text-white shadow-cta transition-all active:scale-95 hover:bg-slate-900"
          aria-label={t("save")}
        >
          <Star className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" />
        </button>

        <button
          onClick={handleSwipeRight}
          className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-muted shadow-sm transition-all active:scale-95 hover:border-emerald-100 hover:bg-emerald-50 hover:text-success"
          aria-label={t("reserve")}
        >
          <MessageSquare className="h-5 w-5 transition-all group-hover:scale-110" />
        </button>
      </div>

      <AnimatePresence>
        {toastState.show && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="pointer-events-none absolute inset-x-4 bottom-28 z-[60] flex justify-center"
          >
            <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-popup">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{toastState.text}</span>

                {toastState.type === "RESERVE" && toastState.exchangeId && (
                  <Link
                    href={localizeHref(locale, `/exchange/${toastState.exchangeId}`)}
                    className="mt-0.5 text-xs font-semibold text-primary hover:underline underline-offset-2"
                  >
                    {t("goToChat")}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
