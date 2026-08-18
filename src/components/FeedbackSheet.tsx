"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2, LogIn, MessageSquare, Package, Plus, Wallet, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { localizeHref } from "@/lib/i18n/pathnames";

export type FeedbackType =
  | "insufficient_swaps"
  | "own_item_forbidden"
  | "auth_required"
  | "unexpected_error"
  | "exchange_reserved";

interface FeedbackSheetProps {
  isOpen: boolean;
  onClose: () => void;
  type: FeedbackType;
  metadata?: {
    amount?: number;
    currentAmount?: number;
    exchangeId?: string;
  };
}

export default function FeedbackSheet({ isOpen, onClose, type, metadata }: FeedbackSheetProps) {
  const locale = useLocale();
  const t = useTranslations("feedbackSheet");

  const getConfig = () => {
    switch (type) {
      case "insufficient_swaps":
        return {
          icon: Wallet,
          iconBg: "bg-danger/10",
          iconColor: "text-danger",
          badge: X,
          badgeBg: "bg-danger",
          ctaHref: "/profile/wallet",
          ctaIcon: Plus,
        };
      case "own_item_forbidden":
        return {
          icon: Package,
          iconBg: "bg-warning/10",
          iconColor: "text-warning",
          badge: AlertCircle,
          badgeBg: "bg-warning",
          ctaHref: "/profile/items",
          ctaIcon: ArrowRight,
        };
      case "auth_required":
        return {
          icon: LogIn,
          iconBg: "bg-primary/10",
          iconColor: "text-primary",
          badge: AlertCircle,
          badgeBg: "bg-primary",
          ctaHref: "/login",
          ctaIcon: LogIn,
        };
      case "exchange_reserved":
        return {
          icon: CheckCircle2,
          iconBg: "bg-success/10",
          iconColor: "text-success",
          badge: CheckCircle2,
          badgeBg: "bg-success",
          ctaHref: metadata?.exchangeId ? `/exchange/${metadata.exchangeId}` : "/messages",
          ctaIcon: MessageSquare,
        };
      default:
        return {
          icon: AlertCircle,
          iconBg: "bg-muted/10",
          iconColor: "text-muted",
          badge: X,
          badgeBg: "bg-muted",
          ctaHref: null,
          ctaIcon: Plus,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const BadgeIcon = config.badge;
  const CtaIcon = config.ctaIcon;
  const missingAmount = Math.max((metadata?.amount ?? 0) - (metadata?.currentAmount ?? 0), 0);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            aria-label="Close"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 210 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-md overflow-hidden rounded-t-[36px] border-t border-border bg-surface shadow-[0_-24px_80px_rgba(0,0,0,0.35)]"
          >
            <div className="px-6 pb-10 pt-4">
              <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-border" />

              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`flex h-20 w-20 items-center justify-center rounded-[26px] ${config.iconBg} ${config.iconColor} border border-border/40 shadow-inner`}
                  >
                    <Icon className="h-10 w-10" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 16 }}
                    className={`absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-surface ${config.badgeBg} text-white shadow-lg`}
                  >
                    <BadgeIcon className="h-4 w-4" strokeWidth={3} />
                  </motion.div>
                </div>
              </div>

              <div className="mb-8 space-y-3 text-center">
                <h3 className="font-display text-[1.9rem] font-bold tracking-[-0.05em] text-foreground">
                  {t(`${type}.title`)}
                </h3>
                <p className="px-4 text-sm leading-6 text-muted">
                  {t(`${type}.body`, { amount: metadata?.amount ?? 0 })}
                </p>
              </div>

              {type === "insufficient_swaps" ? (
                <div className="mb-8 grid grid-cols-3 gap-3">
                  <div className="rounded-[24px] border border-border bg-background/60 p-4 text-center">
                    <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-muted">
                      {t("metrics.current")}
                    </span>
                    <span className="mt-2 block font-display text-[1.7rem] font-bold leading-none tracking-[-0.04em] text-foreground">
                      {metadata?.currentAmount ?? 0}
                    </span>
                  </div>
                  <div className="rounded-[24px] border border-danger/20 bg-danger/5 p-4 text-center">
                    <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-danger/80">
                      {t("metrics.required")}
                    </span>
                    <span className="mt-2 block font-display text-[1.7rem] font-bold leading-none tracking-[-0.04em] text-danger">
                      {metadata?.amount ?? 0}
                    </span>
                  </div>
                  <div className="rounded-[24px] border border-warning/20 bg-warning/5 p-4 text-center">
                    <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-warning/80">
                      {t("metrics.missing")}
                    </span>
                    <span className="mt-2 block font-display text-[1.7rem] font-bold leading-none tracking-[-0.04em] text-warning">
                      {missingAmount}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                {config.ctaHref ? (
                  <Link
                    href={localizeHref(locale, config.ctaHref)}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 rounded-[22px] bg-foreground py-4 text-sm font-black uppercase tracking-[0.18em] text-background shadow-cta transition-all active:scale-95 hover:opacity-90"
                  >
                    <CtaIcon className="h-4 w-4" />
                    {t(`${type}.cta`)}
                  </Link>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 rounded-[22px] bg-foreground py-4 text-sm font-black uppercase tracking-[0.18em] text-background shadow-cta transition-all active:scale-95 hover:opacity-90"
                  >
                    {t(`${type}.cta`)}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-[22px] border border-border bg-surface py-4 text-sm font-black uppercase tracking-[0.18em] text-muted transition-all active:scale-95 hover:text-foreground hover:border-foreground/30"
                >
                  {t(`${type}.secondary`)}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

