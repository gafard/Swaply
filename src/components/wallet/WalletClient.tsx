"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Gift, Info, ShoppingBag, Sparkles, Wallet } from "lucide-react";

import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";
import RechargeModal from "./RechargeModal";
import { formatMoney } from "@/lib/geo";
import { formatDate } from "@/lib/i18n/format";
import { localizeHref } from "@/lib/i18n/pathnames";

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
    if (swapsAmount >= 150) return "🐳";
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
    <main className="min-h-screen bg-background pb-20 font-sans">
      <div className="rounded-b-[38px] bg-[linear-gradient(145deg,#10203a_0%,#173768_60%,#2457ff_100%)] px-6 pb-10 pt-16 text-white shadow-[0_24px_80px_rgba(16,32,58,0.2)]">
        <AnimatedContainer initialY={-10} className="mb-8 flex items-center gap-4">
          <Link href={localizeHref(locale, "/profile")} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-black uppercase tracking-[0.18em]">{t("title")}</h1>
        </AnimatedContainer>

        <AnimatedContainer delay={0.05} className="rounded-[32px] border border-white/12 bg-white/10 p-5 backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/65">{t("availableNow")}</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="font-display text-[3.75rem] font-bold leading-none tracking-[-0.06em]">{availableSwaps}</span>
            <span className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/70">Swaps</span>
          </div>
          <p className="mt-3 max-w-[20rem] text-sm leading-6 text-white/68">{t("welcomeSheet.tipBody")}</p>
        </AnimatedContainer>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <AnimatedItem index={0}>
            <div className="rounded-[26px] border border-white/12 bg-white/8 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-white/72">
                <Wallet className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.16em]">{t("regularBalance")}</span>
              </div>
              <p className="mt-3 font-display text-[2rem] font-bold leading-none tracking-[-0.05em] text-white">{regularSwaps}</p>
              <p className="mt-2 text-[11px] font-medium leading-5 text-white/58">{t("regularBalanceBody")}</p>
            </div>
          </AnimatedItem>
          <AnimatedItem index={1}>
            <div className="rounded-[26px] border border-[#ffdc93]/25 bg-[linear-gradient(180deg,rgba(255,223,154,0.18),rgba(255,255,255,0.08))] p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[#ffe1a7]">
                <Gift className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.16em]">{t("promoBalance")}</span>
              </div>
              <p className="mt-3 font-display text-[2rem] font-bold leading-none tracking-[-0.05em] text-white">{promoSwaps}</p>
              <p className="mt-2 text-[11px] font-medium leading-5 text-white/62">{t("promoBalanceBody")}</p>
            </div>
          </AnimatedItem>
        </div>
      </div>

      <div className="relative z-10 -mt-5 px-5">
        <div className="rounded-[34px] border border-border bg-surface p-6 shadow-[0_18px_48px_rgba(16,32,58,0.08)]">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-foreground">{t("bonusExplainTitle")}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">{t("bonusExplainBody")}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[34px] border border-border bg-surface p-6 shadow-[0_16px_42px_rgba(16,32,58,0.06)]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[13px] font-black uppercase tracking-[0.18em] text-foreground">{t("recentHistory")}</h2>
            <Link href={localizeHref(locale, "/profile/history")} className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              {t("history")}
            </Link>
          </div>

          <div className="space-y-4">
            {userData.transactions.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                  <Info className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium text-muted">{t("noTransactions")}</p>
              </div>
            ) : (
              userData.transactions.slice(0, 4).map((tx: any, idx: number) => {
                const totalAmount = (tx.amount ?? 0) + (tx.promoAmount ?? 0);
                return (
                  <AnimatedItem key={tx.id} index={idx} className="flex items-center justify-between border-b border-border/60 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] text-xl shadow-sm ${
                        totalAmount > 0
                          ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                          : "border border-rose-100 bg-rose-50 text-rose-600"
                      }`}>
                        {tx.type === "SIGNUP_BONUS"
                          ? "✨"
                          : tx.type === "TOPUP"
                            ? "💳"
                            : tx.type === "EXCHANGE_IN" || tx.type === "EXCHANGE_OUT"
                              ? "🔄"
                              : tx.type === "REFUND"
                                ? "↩️"
                                : "◈"}
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tight text-foreground">{tx.description || tx.type}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted/70">
                          {formatDate(locale, tx.createdAt, { day: "numeric", month: "long" })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-black ${totalAmount > 0 ? "text-emerald-500" : "text-slate-500"}`}>
                      {totalAmount > 0 ? "+" : ""}
                      {totalAmount}
                    </span>
                  </AnimatedItem>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-4 flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-[13px] font-black uppercase tracking-[0.18em] text-foreground">{t("buySwaps")}</h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted/70">
                {userData.countryName ?? t("undefinedMarket")}
              </p>
            </div>
          </div>
          {topupPackages.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-border bg-surface px-6 py-8 text-center">
              <p className="text-sm font-semibold text-foreground">{t("noPackage")}</p>
              <p className="mt-2 text-[11px] leading-5 text-muted">{t("configureCountry")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {topupPackages.map((pack, idx) => {
                const isPopular = idx === 1 || pack.swapsAmount === 12;
                return (
                  <AnimatedItem key={pack.id} index={idx}>
                    <button
                      onClick={() => handleBuyPack(pack)}
                      className={`relative w-full rounded-[28px] border bg-surface p-5 text-left transition-all active:scale-[0.98] ${
                        isPopular ? "border-primary shadow-[0_18px_38px_rgba(36,87,255,0.1)]" : "border-border shadow-sm"
                      }`}
                    >
                      {isPopular ? (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-white shadow-cta">
                          {t("popular")}
                        </span>
                      ) : null}
                      <span className="text-3xl">{packBadge(pack.swapsAmount)}</span>
                      <p className="mt-3 text-xl font-black tracking-tight text-foreground">{pack.swapsAmount} SC</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted">{packLabel(pack.swapsAmount)}</p>
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-primary/70">{pack.paymentProvider.name}</p>
                      <div className="my-3 h-px bg-border" />
                      <p className="text-sm font-black text-primary">{formatMoney(pack.localAmount, pack.currencyCode, locale)}</p>
                    </button>
                  </AnimatedItem>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-10 rounded-[34px] bg-slate-950 p-7 text-white shadow-[0_18px_44px_rgba(16,32,58,0.14)]">
          <h2 className="mb-6 flex items-center gap-3 text-[13px] font-black uppercase tracking-[0.18em]">
            <div className="h-6 w-1.5 rounded-full bg-[#f0b429]" />
            {t("rules")}
          </h2>
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">🔒</div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em]">{t("noWithdrawal")}</p>
                <p className="mt-1 text-[11px] leading-5 text-white/60">{t("noWithdrawalBody")}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">⚖️</div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em]">{t("localEconomy")}</p>
                <p className="mt-1 text-[11px] leading-5 text-white/60">{t("localEconomyBody")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RechargeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedPack={selectedPack} />
    </main>
  );
}
