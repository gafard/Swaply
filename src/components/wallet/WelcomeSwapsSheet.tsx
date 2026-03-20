"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Wallet, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { localizeHref } from "@/lib/i18n/pathnames";

interface WelcomeSwapsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  promoSwaps: number;
  availableSwaps: number;
}

export default function WelcomeSwapsSheet({
  isOpen,
  onClose,
  promoSwaps,
  availableSwaps,
}: WelcomeSwapsSheetProps) {
  const locale = useLocale();
  const t = useTranslations("wallet");

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed inset-x-0 bottom-0 z-[80] mx-auto w-full max-w-md rounded-t-[34px] border-t border-white/60 bg-white px-6 pb-10 pt-6 shadow-[0_-20px_80px_rgba(16,32,58,0.16)]"
          >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-amber-50 text-amber-600">
                <Gift className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-[1.6rem] font-bold tracking-[-0.05em] text-slate-950">
                  {t("welcomeSheet.title")}
                </h3>
                <p className="text-sm leading-6 text-slate-500">
                  {t("welcomeSheet.body", { amount: promoSwaps })}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[24px] border border-amber-100 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <Gift className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.16em]">
                    {t("promoBalance")}
                  </span>
                </div>
                <p className="mt-3 font-display text-[2rem] font-bold leading-none tracking-[-0.05em] text-slate-950">
                  {promoSwaps}
                </p>
                <p className="mt-2 text-[11px] font-medium leading-5 text-slate-500">
                  {t("promoBalanceBody")}
                </p>
              </div>
              <div className="rounded-[24px] border border-indigo-100 bg-indigo-50/70 p-4">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Wallet className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.16em]">
                    {t("availableNow")}
                  </span>
                </div>
                <p className="mt-3 font-display text-[2rem] font-bold leading-none tracking-[-0.05em] text-slate-950">
                  {availableSwaps}
                </p>
                <p className="mt-2 text-[11px] font-medium leading-5 text-slate-500">
                  {t("welcomeSheet.availableBody")}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                  <Zap className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-800">
                    {t("welcomeSheet.tipTitle")}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {t("welcomeSheet.tipBody")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={localizeHref(locale, "/discover")}
                onClick={onClose}
                className="flex items-center justify-center rounded-[22px] bg-slate-950 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_34px_rgba(16,32,58,0.16)]"
              >
                {t("welcomeSheet.primary")}
              </Link>
              <Link
                href={localizeHref(locale, "/profile/wallet")}
                onClick={onClose}
                className="flex items-center justify-center rounded-[22px] border border-slate-200 bg-white py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-600"
              >
                {t("welcomeSheet.secondary")}
              </Link>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
