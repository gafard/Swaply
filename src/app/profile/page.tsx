import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { ExchangeStatus, UserRole } from "@prisma/client";
import {
  Settings,
  LogOut,
  Star,
  Package,
  ShieldCheck,
  ChevronRight,
  Heart,
  Siren,
} from "lucide-react";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { formatDate } from "@/lib/i18n/format";
import { localizeHref } from "@/lib/i18n/pathnames";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const [locale, t] = await Promise.all([getLocale(), getTranslations("profile")]);

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-5 font-sans">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t("notConnected")}</h1>
        <p className="text-gray-500 text-center mb-8">
          {t("notConnectedDescription")}
        </p>
        <Link
          href={localizeHref(locale, "/login")}
          className="bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl w-full text-center shadow-lg shadow-indigo-200"
        >
          {t("login")}
        </Link>
      </main>
    );
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const activeItemsCount = await prisma.item.count({
    where: { ownerId: user.id, status: "AVAILABLE" },
  });

  const completedExchanges = await prisma.exchange.count({
    where: {
      OR: [{ ownerId: user.id }, { requesterId: user.id }],
      status: ExchangeStatus.COMPLETED,
    },
  });
  const canModerate = user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR;
  const pendingReportsCount = canModerate
    ? await prisma.itemReport.count({
        where: {
          status: "PENDING",
        },
      })
    : 0;

  const totalSwaps = (wallet?.balanceSwaps ?? 0) + (wallet?.promoSwaps ?? 0);
  const transactions = wallet?.transactions ?? [];

  return (
    <main className="min-h-screen bg-background pb-24 font-sans sm:pb-8 relative">
      <div className="bg-surface rounded-b-[40px] pt-16 pb-10 px-6 shadow-card relative z-10 border-b border-border">
        <AnimatedContainer initialY={-20} className="flex justify-between items-start mb-8">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {t("title")}
          </h1>
          <button className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 border border-border hover:bg-slate-100 transition-all active:scale-95 shadow-sm">
            <Settings className="w-5.5 h-5.5" />
          </button>
        </AnimatedContainer>

        <AnimatedContainer delay={0.1} className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-[32px] bg-primary flex items-center justify-center text-4xl font-bold text-white shadow-cta border-4 border-surface overflow-hidden">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-foreground leading-tight tracking-tight">
              {user.username}
            </h2>
            <p className="text-sm font-medium text-muted mb-4">{user.email}</p>
            <div className="flex items-center gap-2 bg-primary/5 text-primary px-3.5 py-2 rounded-2xl w-max border border-primary/10 shadow-inner">
              <Star className="w-4 h-4 fill-primary" />
              <span className="text-[11px] font-bold uppercase tracking-tight">
                {t("trustScore", {value: user.trustScore})}
              </span>
            </div>
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={0.2} className="flex gap-4 mt-10">
          <Link
            href={localizeHref(locale, "/profile/wallet")}
            className="flex-1 bg-gradient-to-br from-[#F0B429] to-[#C8860A] rounded-[28px] p-6 shadow-lg shadow-gold/20 border border-white/10 group active:scale-[0.98] transition-transform"
          >
            <p className="text-[10px] font-black text-white/70 mb-1.5 uppercase tracking-widest">
              {t("wallet")}
            </p>
            <div className="flex items-end gap-2 text-white">
              <p className="text-3xl font-black leading-none">{totalSwaps}</p>
              <span className="text-[10px] font-black mb-1 opacity-70 tracking-tighter">
                SWAPS
              </span>
            </div>
          </Link>
          <div className="flex-[1.3] bg-background border border-border rounded-[28px] p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="flex flex-col justify-center border-r border-border pr-2 text-center">
                <span className="text-[9px] font-black text-muted uppercase tracking-widest mb-1.5 leading-none">
                  {t("items")}
                </span>
                <span className="text-xl font-black text-foreground">
                  {activeItemsCount}
                </span>
              </div>
              <div className="flex flex-col justify-center pl-2 text-center">
                <span className="text-[9px] font-black text-muted uppercase tracking-widest mb-1.5 leading-none">
                  {t("exchanges")}
                </span>
                <span className="text-xl font-black text-foreground">
                  {completedExchanges}
                </span>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>

      <div className="px-5 pt-8">
        <AnimatedItem index={-1}>
          <div className="flex items-center justify-between px-3 mb-4">
            <h3 className="text-[11px] font-black text-muted uppercase tracking-widest">
              {t("swapsActivity")}
            </h3>
            <Link
              href={localizeHref(locale, "/profile/wallet")}
              className="text-[10px] font-black text-primary uppercase tracking-wider"
            >
              {t("seeAll")}
            </Link>
          </div>
          <div className="bg-surface rounded-[32px] border border-border p-2 space-y-1">
            {transactions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs text-muted font-medium italic">
                  {t("noTransactions")}
                </p>
              </div>
            ) : (
              transactions.map((transaction) => {
                const totalDelta = transaction.amount + transaction.promoAmount;
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-3xl hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                          totalDelta > 0
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {transaction.type === "SIGNUP_BONUS"
                          ? "✨"
                          : transaction.type === "TOPUP"
                            ? "💳"
                            : transaction.type === "EXCHANGE_IN" ||
                                transaction.type === "EXCHANGE_OUT"
                              ? "🔄"
                              : "◈"}
                      </div>
                      <div>
                        <p className="text-xs font-black text-foreground leading-tight">
                          {transaction.description || transaction.type}
                        </p>
                        <p className="text-[10px] font-bold text-muted mt-0.5 uppercase tracking-tighter">
                          {formatDate(locale, transaction.createdAt, { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-black italic ${
                        totalDelta > 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {totalDelta > 0 ? "+" : ""}
                      {totalDelta} SC
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </AnimatedItem>
      </div>

      <div className="px-5 pt-10 space-y-4">
        <AnimatedItem index={0}>
          <h3 className="text-[11px] font-bold text-muted uppercase tracking-widest px-3 mb-3">
            {t("activities")}
          </h3>
        </AnimatedItem>

        <AnimatedItem index={1}>
          <Link
            href={localizeHref(locale, "/profile/items")}
            className="flex items-center justify-between bg-surface px-6 py-5 rounded-[28px] border border-border shadow-sm hover:border-primary/30 transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform shadow-inner">
                <Package className="w-5.5 h-5.5" />
              </div>
              <span className="font-semibold text-[15px] text-foreground">
                {t("manageItems")}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </AnimatedItem>

        <AnimatedItem index={2}>
          <Link
            href={localizeHref(locale, "/favorites")}
            className="flex items-center justify-between bg-surface px-6 py-5 rounded-[28px] border border-border shadow-sm hover:border-primary/30 transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 group-hover:scale-110 transition-transform shadow-inner">
                <Heart className="w-5.5 h-5.5 fill-rose-500" />
              </div>
              <span className="font-semibold text-[15px] text-foreground">
                {t("favorites")}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </AnimatedItem>

        <AnimatedItem index={3}>
          <Link
            href={localizeHref(locale, "/profile/history")}
            className="flex items-center justify-between bg-surface px-6 py-5 rounded-[28px] border border-border shadow-sm hover:border-primary/30 transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 group-hover:scale-110 transition-transform shadow-inner">
                <ShieldCheck className="w-5.5 h-5.5" />
              </div>
              <span className="font-semibold text-[15px] text-foreground">
                {t("history")}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </AnimatedItem>

        <AnimatedItem index={4} className="pt-6">
          {canModerate ? (
            <Link
              href={localizeHref(locale, "/profile/moderation")}
              className="mb-4 flex items-center justify-between rounded-[28px] border border-amber-100 bg-amber-50 px-6 py-5 shadow-sm transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-100 bg-white text-amber-600 shadow-inner">
                  <Siren className="h-5.5 w-5.5" />
                </div>
                <div>
                  <span className="block text-[15px] font-semibold text-foreground">
                    {t("moderation")}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700/80">
                    {t("reportsPending", {count: pendingReportsCount})}
                  </span>
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-colors">
                <ChevronRight className="h-5 w-5 text-amber-600" />
              </div>
            </Link>
          ) : null}

          {/* Language Settings */}
          <div className="mb-4 flex items-center justify-between rounded-[28px] border border-border bg-surface px-6 py-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.148" />
                </svg>
              </div>
              <div>
                <span className="block text-[15px] font-semibold text-foreground">
                  Langue
                </span>
                <span className="text-[10px] font-medium text-muted uppercase tracking-wide">
                  Choisir la langue de l'application
                </span>
              </div>
            </div>
            <LocaleSwitcher variant="select" />
          </div>

          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-rose-50/50 text-rose-600 font-bold px-6 py-5 rounded-[28px] border border-rose-100 hover:bg-rose-50 transition-all active:scale-[0.98] shadow-sm"
            >
              <LogOut className="w-5.5 h-5.5" />
              {t("logout")}
            </button>
          </form>
        </AnimatedItem>
      </div>
    </main>
  );
}
