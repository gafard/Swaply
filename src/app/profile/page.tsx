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
  Sparkles,
  Wallet,
} from "lucide-react";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedContainer";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { formatDate } from "@/lib/i18n/format";
import { localizeHref } from "@/lib/i18n/pathnames";
import { LevelProgress } from "@/components/profile/LevelProgress";
import { BadgeGrid } from "@/components/profile/BadgeGrid";
import { ThemeToggle } from "@/components/ThemeToggle";
import NumberTicker from "@/components/ui/NumberTicker";
import HoloBadge from "@/components/ui/HoloBadge";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const [locale, t] = await Promise.all([getLocale(), getTranslations("profile")]);

  if (!user) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl border border-primary/20 flex items-center justify-center mb-6 shadow-sm">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">{t("notConnected")}</h1>
        <p className="text-sm text-muted max-w-xs mb-8">
          {t("notConnectedDescription")}
        </p>
        <Link
          href={localizeHref(locale, "/login")}
          className="bg-primary text-white font-bold px-8 py-4 rounded-2xl w-full max-w-xs text-center shadow-cta hover:bg-primary-hover transition-all"
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

  const allAchievements = await prisma.achievement.findMany();
  const userBadges = await prisma.userAchievement.findMany({
    where: { userId: user.id },
    include: { achievement: true },
  });
  const normalizedBadges = userBadges.map((ub) => ({
    ...ub.achievement,
    earnedAt: ub.earnedAt,
  }));

  return (
    <main className="min-h-screen bg-background pb-32 font-sans relative">
      {/* Header Profile Cockpit */}
      <div className="bg-surface rounded-b-[40px] pt-12 pb-8 px-6 shadow-md relative z-10 border-b border-border">
        <AnimatedContainer initialY={-20} className="flex justify-between items-center mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
            {t("title")}
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </AnimatedContainer>

        {/* User Identity Row */}
        <AnimatedContainer delay={0.1} className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-primary via-indigo-600 to-pink-500 flex items-center justify-center text-3xl font-black text-white shadow-cta border-4 border-surface overflow-hidden">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-surface bg-success" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h2 className="font-display text-2xl font-bold text-foreground truncate leading-tight">
              {user.username}
            </h2>
            <p className="text-xs text-muted truncate">{user.email}</p>
            <div className="flex items-center gap-1.5 pt-1">
              <HoloBadge variant="gold" size="sm" icon={<Star className="w-3 h-3 fill-amber-400 text-amber-400" />}>
                {t("trustScore", { value: user.trustScore })}
              </HoloBadge>
            </div>
          </div>
        </AnimatedContainer>

        {/* Quick Wallet Card */}
        <AnimatedContainer delay={0.2} className="flex gap-3 mt-6">
          <Link
            href={localizeHref(locale, "/profile/wallet")}
            className="flex-1 rounded-[26px] border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent p-4 shadow-sm group active:scale-[0.98] transition-all hover:border-amber-500/50"
          >
            <span className="block text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              {t("wallet")}
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold text-foreground">
                <NumberTicker value={totalSwaps} />
              </span>
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                SWAPS
              </span>
            </div>
          </Link>

          <div className="flex-[1.2] bg-surface-raised border border-border rounded-[26px] p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-2 h-full items-center">
              <div className="border-r border-border pr-2 text-center">
                <span className="block text-[8px] font-black text-muted uppercase tracking-wider mb-1">
                  {t("items")}
                </span>
                <span className="font-display text-xl font-bold text-foreground">
                  {activeItemsCount}
                </span>
              </div>
              <div className="pl-2 text-center">
                <span className="block text-[8px] font-black text-muted uppercase tracking-wider mb-1">
                  {t("exchanges")}
                </span>
                <span className="font-display text-xl font-bold text-foreground">
                  {completedExchanges}
                </span>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>

      <div className="mx-auto max-w-md px-4 pt-6 space-y-6">
        {/* Gamification Progress */}
        <AnimatedItem index={-2}>
          <LevelProgress level={user.level} xp={user.xp} />
        </AnimatedItem>

        <AnimatedItem index={-1.5}>
          <BadgeGrid badges={normalizedBadges} allAchievements={allAchievements} />
        </AnimatedItem>

        {/* Action Menu Rows */}
        <div className="space-y-3 pt-2">
          <AnimatedItem index={0}>
            <span className="block text-[10px] font-black text-muted uppercase tracking-widest px-2 mb-2">
              {t("activities")}
            </span>
          </AnimatedItem>

          <AnimatedItem index={1}>
            <Link
              href={localizeHref(locale, "/profile/items")}
              className="flex items-center justify-between bg-surface px-5 py-4 rounded-[24px] border border-border shadow-sm hover:border-primary/40 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-foreground">
                  {t("manageItems")}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </Link>
          </AnimatedItem>

          <AnimatedItem index={2}>
            <Link
              href={localizeHref(locale, "/favorites")}
              className="flex items-center justify-between bg-surface px-5 py-4 rounded-[24px] border border-border shadow-sm hover:border-primary/40 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <span className="font-bold text-sm text-foreground">
                  {t("favorites")}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </Link>
          </AnimatedItem>

          <AnimatedItem index={3}>
            <Link
              href={localizeHref(locale, "/profile/history")}
              className="flex items-center justify-between bg-surface px-5 py-4 rounded-[24px] border border-border shadow-sm hover:border-primary/40 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-foreground">
                  {t("history")}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </Link>
          </AnimatedItem>

          {canModerate && (
            <AnimatedItem index={4}>
              <Link
                href={localizeHref(locale, "/profile/moderation")}
                className="flex items-center justify-between bg-amber-500/10 border border-amber-500/25 px-5 py-4 rounded-[24px] shadow-sm transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Siren className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-foreground">
                      {t("moderation")}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                      {t("reportsPending", { count: pendingReportsCount })}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </Link>
            </AnimatedItem>
          )}

          {/* Language Selector */}
          <div className="flex items-center justify-between rounded-[24px] border border-border bg-surface px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-bold text-sm text-foreground">
                  Langue
                </span>
                <span className="text-[10px] text-muted uppercase">
                  Choisir la langue
                </span>
              </div>
            </div>
            <LocaleSwitcher variant="select" />
          </div>

          {/* Logout */}
          <form action="/api/auth/signout" method="POST" className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 bg-danger/10 text-danger font-bold px-6 py-4 rounded-[24px] border border-danger/20 hover:bg-danger/20 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("logout")}</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
