"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Wallet, Info, Sparkles, ShoppingBag, Lock } from "lucide-react";
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
      {/* Header */}
      <div className="bg-gradient-to-br from-[#F0B429] to-[#C8860A] pt-16 pb-12 px-6 rounded-b-[40px] shadow-lg shadow-gold/20 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Wallet className="w-48 h-48" />
         </div>
         
         <AnimatedContainer initialY={-10} className="flex items-center gap-4 mb-8">
            <Link href={localizeHref(locale, "/profile")} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
               <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-black uppercase tracking-widest">{t("title")}</h1>
         </AnimatedContainer>

         <AnimatedContainer delay={0.1} className="relative z-10 text-center py-4">
            <p className="text-white/70 text-xs font-black uppercase tracking-[0.2em] mb-2">{t("currentBalance")}</p>
            <div className="flex items-center justify-center gap-3">
               <span className="text-6xl font-black tracking-tighter">{userData.swaps ?? 0}</span>
               <div className="flex flex-col items-start leading-none">
                  <span className="text-lg font-black italic">SWAPS</span>
                  <Sparkles className="w-4 h-4 text-white/50" />
               </div>
            </div>
         </AnimatedContainer>

         <div className="flex gap-3 mt-8">
            <div className="flex-1 bg-white/15 backdrop-blur-md text-white border border-white/15 font-black text-[11px] uppercase tracking-widest py-3 rounded-2xl flex items-center justify-center gap-2 opacity-90">
               <Lock className="w-3.5 h-3.5" />
               {t("transfersClosed")}
            </div>
            <Link
              href={localizeHref(locale, "/profile/history")}
              className="flex-1 bg-white text-[#C8860A] font-black text-[11px] uppercase tracking-widest py-3 rounded-2xl shadow-md active:scale-95 transition-all text-center"
            >
               {t("history")}
            </Link>
         </div>
      </div>

      <div className="px-5 -mt-6 relative z-20">
         {/* History Card */}
         <div className="bg-surface rounded-[40px] border border-border shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-[13px] font-black text-foreground uppercase tracking-wider">{t("recentHistory")}</h2>
               <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted" />
               </div>
            </div>

            <div className="space-y-4">
               {userData.transactions.length === 0 ? (
                 <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                       <Info className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium text-muted">{t("noTransactions")}</p>
                 </div>
               ) : (
                 userData.transactions.slice(0, 3).map((tx: any, idx: number) => {
                  const totalAmount = (tx.amount ?? 0) + (tx.promoAmount ?? 0);
                  return (
                  <AnimatedItem key={tx.id} index={idx} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center text-xl shadow-sm ${
                           totalAmount > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                           {tx.type === 'SIGNUP_BONUS' ? '✨' :
                            tx.type === 'TOPUP' ? '💳' :
                            tx.type === 'EXCHANGE_IN' || tx.type === 'EXCHANGE_OUT' ? '🔄' :
                            tx.type === 'REFUND' ? '↩️' : '◈'}
                        </div>
                        <div>
                           <p className="text-sm font-black text-foreground leading-tight tracking-tight">{tx.description || tx.type}</p>
                           <p className="text-[10px] font-bold text-muted mt-1 uppercase tracking-tighter italic">
                              {formatDate(locale, tx.createdAt, { day: "numeric", month: "long" })}
                           </p>
                        </div>
                     </div>
                     <span className={`text-sm font-black ${totalAmount > 0 ? 'text-emerald-500 italic' : 'text-slate-500'}`}>
                        {totalAmount > 0 ? '+' : ''}{totalAmount}
                     </span>
                  </AnimatedItem>
                 );
                 })
               )}
            </div>
         </div>

         {/* Purchase Packs */}
         <div className="mt-10">
            <div className="flex items-center gap-2 mb-4 px-3">
               <ShoppingBag className="w-4 h-4 text-primary" />
               <div>
                 <h2 className="text-[12px] font-black text-foreground uppercase tracking-widest">{t("buySwaps")}</h2>
                 <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">
                   {userData.countryName ?? t("undefinedMarket")}
                 </p>
               </div>
            </div>
            {topupPackages.length === 0 ? (
              <div className="rounded-[32px] border border-dashed border-border bg-surface px-6 py-8 text-center">
                <p className="text-sm font-semibold text-foreground">{t("noPackage")}</p>
                <p className="text-[11px] text-muted font-medium mt-2 leading-relaxed">
                  {t("configureCountry")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                 {topupPackages.map((pack, idx) => {
                   const isPopular = idx === 1 || pack.swapsAmount === 12;
                   return (
                    <AnimatedItem key={pack.id} index={idx}>
                      <button
                        onClick={() => handleBuyPack(pack)}
                        className={`w-full bg-surface border p-5 rounded-[32px] flex flex-col items-center text-center relative active:scale-95 transition-all text-left ${
                          isPopular ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'
                        }`}
                      >
                        {isPopular && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-cta">
                              {t("popular")}
                            </span>
                        )}
                        <span className="text-3xl mb-3">{packBadge(pack.swapsAmount)}</span>
                        <p className="text-xl font-black text-foreground tracking-tighter">{pack.swapsAmount} SC</p>
                        <p className="text-[10px] font-bold text-muted uppercase mt-1">{packLabel(pack.swapsAmount)}</p>
                        <p className="text-[9px] font-black text-primary/70 uppercase tracking-widest mt-2">
                          {pack.paymentProvider.name}
                        </p>
                        <div className="w-full h-px bg-border my-3" />
                        <p className="text-sm font-black text-primary">
                          {formatMoney(pack.localAmount, pack.currencyCode, locale)}
                        </p>
                      </button>
                    </AnimatedItem>
                   );
                 })}
              </div>
            )}
         </div>

         {/* Rules Section */}
         <div className="mt-10 bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
            <h2 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3">
               <div className="w-1.5 h-6 bg-gold rounded-full" />
               {t("rules")}
            </h2>
            <div className="space-y-6">
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">🔒</div>
                  <div>
                     <p className="text-xs font-black uppercase tracking-wider mb-1">{t("noWithdrawal")}</p>
                     <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                        {t("noWithdrawalBody")}
                     </p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">⚖️</div>
                  <div>
                     <p className="text-xs font-black uppercase tracking-wider mb-1">{t("localEconomy")}</p>
                     <p className="text-[11px] text-white/60 leading-relaxed font-medium italic">
                        {t("localEconomyBody")}
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <RechargeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPack={selectedPack}
      />
    </main>
  );
}
