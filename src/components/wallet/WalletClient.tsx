"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Gift, Info, ShoppingBag, Sparkles, Wallet, ShieldCheck, Zap } from "lucide-react";

import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";
import RechargeModal from "./RechargeModal";
import { formatMoney } from "@/lib/geo";
import { formatDate } from "@/lib/i18n/format";
import { localizeHref } from "@/lib/i18n/pathnames";
import NumberTicker from "@/components/ui/NumberTicker";
import HoloBadge from "@/components/ui/HoloBadge";
import SpotlightCard from "@/components/ui/SpotlightCard";

interface Props {
  userData: any;
  topupPackages: Array<{
    id: string;
    localAmount: number;
    currencyCode: string;
    swapsAmount: number;
    country: {
      id: string;
      code: string;
      name: string;
    };
    paymentProvider: {
      id: string;
      code: string;
      name: string;
    };
  }>;
}

type TopupPackage = Props["topupPackages"][number];

export default function WalletClient({ userData, topupPackages }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<TopupPackage | null>(null);
  const locale = useLocale();
  const t = useTranslations("wallet");

  const availableSwaps = userData.availableSwaps ?? ((userData.swaps ?? 0) + (userData.promoSwaps ?? 0));
  const regularSwaps = userData.swaps ?? 0;
  const promoSwaps = userData.promoSwaps ?? 0;

  const packBadge = (swapsAmount: number) => {
    if (swapsAmount >= 150) return "👑";
    if (swapsAmount >= 80) return "🔥";
    if (swapsAmount >= 35) return "💼";
    if (swapsAmount >= 12) return "🚀";
    return "🌱";
  };

  const packLabel = (swapsAmount: number) => {
    if (swapsAmount >= 150) return t("pack.global");
    if (swapsAmount >= 80) return t("pack.trader");
    if (swapsAmount >= 35) return t("pack.pro");
    if (swapsAmount >= 12) return t("pack.standard");
    return t("pack.starter");
  };

  const handleBuyPack = (pack: TopupPackage) => {
    setSelectedPack(pack);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-background pb-32 font-sans">
      {/* Hero Virtual Card Section */}
      <div className="rounded-b-[42px] bg-gradient-to-br from-surface-raised via-surface to-primary/10 px-6 pb-10 pt-12 text-foreground border-b border-border shadow-lg">
        <AnimatedContainer initialY={-10} className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={localizeHref(locale, "/profile")}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-display text-lg font-bold text-foreground">{t("title")}</h1>
          </div>
          <HoloBadge variant="primary" size="sm">
            SwapVault
          </HoloBadge>
        </AnimatedContainer>

        {/* 3D Luxury Metallic Card with Official Gradient */}
        <AnimatedContainer delay={0.05} className="relative overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl">
          {/* Ambient Card Glow with Official Palette */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-pink-500/25 blur-3xl" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-8 rounded-md bg-gradient-to-r from-emerald-400 via-teal-500 to-purple-500 shadow-sm" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                Swaply Card ✨
              </span>
            </div>
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
          </div>

          <div className="relative z-10 mt-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/60">
              {t("availableNow")}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white">
                <NumberTicker value={availableSwaps} />
              </span>
              <span className="text-sm font-black uppercase tracking-widest text-emerald-400">
                SWAPS
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
            <div>
              <span className="block text-[8px] font-black uppercase tracking-widest text-white/50">
                Titulaire
              </span>
              <span className="font-bold text-white uppercase">{userData.username || "Swaply User"}</span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-black uppercase tracking-widest text-white/50">
                Région
              </span>
              <span className="font-bold text-white uppercase">{userData.countryName || "International"}</span>
            </div>
          </div>
        </AnimatedContainer>


        {/* Dual Balances Breakdown */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <AnimatedItem index={0}>
            <div className="rounded-[24px] border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Wallet className="h-4 w-4" />
                <span className="text-[9px] font-black uppercase tracking-wider">{t("regularBalance")}</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                <NumberTicker value={regularSwaps} />
              </p>
              <p className="mt-1 text-[10px] text-muted leading-tight">{t("regularBalanceBody")}</p>
            </div>
          </AnimatedItem>

          <AnimatedItem index={1}>
            <div className="rounded-[24px] border border-amber-500/25 bg-amber-500/10 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                <Gift className="h-4 w-4" />
                <span className="text-[9px] font-black uppercase tracking-wider">{t("promoBalance")}</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                <NumberTicker value={promoSwaps} />
              </p>
              <p className="mt-1 text-[10px] text-amber-600/80 dark:text-amber-400/80 leading-tight">{t("promoBalanceBody")}</p>
            </div>
          </AnimatedItem>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-6 space-y-6">
        {/* Packages Shop */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <h2 className="font-display text-sm font-bold text-foreground">{t("buySwaps")}</h2>
            </div>
            <span className="text-[10px] font-bold text-muted uppercase">
              {userData.countryName ?? t("undefinedMarket")}
            </span>
          </div>

          {topupPackages.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-center">
              <p className="text-sm font-semibold text-foreground">{t("noPackage")}</p>
              <p className="mt-1 text-xs text-muted">{t("configureCountry")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {topupPackages.map((pack, idx) => {
                const isPopular = idx === 1 || pack.swapsAmount === 12;
                return (
                  <AnimatedItem key={pack.id} index={idx}>
                    <button
                      onClick={() => handleBuyPack(pack)}
                      className={`relative w-full rounded-[26px] border bg-surface p-4 text-left transition-all active:scale-[0.98] ${
                        isPopular
                          ? "border-primary/50 shadow-md bg-gradient-to-br from-surface to-primary/5"
                          : "border-border shadow-sm hover:border-primary/30"
                      }`}
                    >
                      {isPopular && (
                        <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[8px] font-black uppercase text-white shadow-sm">
                          {t("popular")}
                        </span>
                      )}
                      <span className="text-2xl">{packBadge(pack.swapsAmount)}</span>
                      <p className="mt-2 font-display text-lg font-bold text-foreground">
                        {pack.swapsAmount} SC
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted">
                        {packLabel(pack.swapsAmount)}
                      </p>
                      <div className="my-2 h-px bg-border" />
                      <p className="font-display text-xs font-bold text-primary">
                        {formatMoney(pack.localAmount, pack.currencyCode, locale)}
                      </p>
                    </button>
                  </AnimatedItem>
                );
              })}
            </div>
          )}
        </div>

        {/* Transactions History Card */}
        <div className="rounded-[30px] border border-border bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-foreground">{t("recentHistory")}</h2>
            <Link
              href={localizeHref(locale, "/profile/history")}
              className="text-[10px] font-black uppercase tracking-wider text-primary hover:underline"
            >
              {t("history")} &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {userData.transactions.length === 0 ? (
              <div className="py-6 text-center text-muted text-xs font-medium">
                {t("noTransactions")}
              </div>
            ) : (
              userData.transactions.slice(0, 4).map((tx: any, idx: number) => {
                const totalAmount = (tx.amount ?? 0) + (tx.promoAmount ?? 0);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-raised text-sm">
                        {totalAmount > 0 ? "✨" : "🔄"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{tx.description || tx.type}</p>
                        <p className="text-[9px] text-muted uppercase">
                          {formatDate(locale, tx.createdAt, { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${totalAmount > 0 ? "text-success" : "text-foreground-muted"}`}>
                      {totalAmount > 0 ? `+${totalAmount}` : totalAmount}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <RechargeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedPack={selectedPack} />
    </main>
  );
}
