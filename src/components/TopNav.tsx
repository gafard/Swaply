"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Search, Sparkles, Wallet } from "lucide-react";

import AppLogo from "@/components/AppLogo";
import NumberTicker from "@/components/ui/NumberTicker";
import { localizeHref } from "@/lib/i18n/pathnames";
import { cn } from "@/lib/utils";

export default function TopNav({
  unreadCount,
  user,
  showGuestActions = true,
  showSearch = false,
  showBalance = true,
}: {
  unreadCount: number;
  user: any;
  showGuestActions?: boolean;
  showSearch?: boolean;
  showBalance?: boolean;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("topNav");
  const [query, setQuery] = useState("");

  const balance = user?.availableSwaps ?? user?.swaps ?? user?.credits ?? 0;
  const promoSwaps = user?.promoSwaps ?? 0;
  const notificationLabel = String(unreadCount).padStart(2, "0");
  const hasGuestActions = !user && showGuestActions;

  const prefetchRoutes = useMemo(
    () =>
      user
        ? ["/", "/discover", "/notifications", "/publish", "/messages", "/profile"]
        : ["/", "/discover", "/login", "/signup"],
    [user]
  );

  useEffect(() => {
    prefetchRoutes.forEach((route) => {
      router.prefetch(localizeHref(locale, route));
    });
  }, [locale, prefetchRoutes, router]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    const target = trimmed
      ? `${localizeHref(locale, "/discover")}?q=${encodeURIComponent(trimmed)}`
      : localizeHref(locale, "/discover");

    router.push(target);
  };

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="sticky top-0 z-40 px-4 pb-3 pt-3 backdrop-blur-2xl sm:px-6 sm:pb-4 sm:pt-4"
    >
      <div className="mx-auto max-w-md space-y-2.5">
        <div className="relative overflow-hidden rounded-[28px] border border-border bg-surface/85 p-3.5 shadow-md backdrop-blur-2xl">
          {/* Top highlight glow */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="relative flex items-center justify-between gap-3">
            <Link href={localizeHref(locale, "/")} prefetch className="min-w-0 flex-1 group">
              <div className="flex items-center gap-3">
                <AppLogo size={38} className="shrink-0" priority />
                <div className="min-w-0">
                  <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                    Swaply
                  </span>
                  <p className="truncate font-display text-[1.1rem] font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {user?.username ? `${t("hello")}, ${user.username}` : "Swaply"}
                  </p>
                </div>
              </div>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={localizeHref(locale, "/notifications")}
                  prefetch
                  className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface-raised/80 text-foreground transition-all hover:border-primary/40 active:scale-95 shadow-sm"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full border-2 border-surface bg-danger px-1 py-0.2 text-[8px] font-black text-white shadow-sm">
                      {notificationLabel}
                    </span>
                  )}
                </Link>
                <Link
                  href={localizeHref(locale, "/profile")}
                  prefetch
                  className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-pink-500 text-sm font-black uppercase text-white shadow-cta transition-transform hover:scale-105 active:scale-95"
                >
                  {user?.username?.charAt(0) || "S"}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-success" />
                </Link>
              </div>
            ) : hasGuestActions ? (
              <div className="flex items-center gap-2">
                <Link
                  href={localizeHref(locale, "/login")}
                  prefetch
                  className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-foreground-muted shadow-sm hover:text-foreground transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  href={localizeHref(locale, "/signup")}
                  prefetch
                  className="rounded-full bg-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-cta hover:bg-primary-hover transition-all"
                >
                  {t("signup")}
                </Link>
              </div>
            ) : null}
          </div>

          {showBalance && user && (
            <Link
              href={localizeHref(locale, "/profile/wallet")}
              className="group relative mt-3 flex items-center justify-between gap-3 overflow-hidden rounded-[20px] border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-3.5 py-2.5 transition-all hover:border-amber-500/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    {t("balance")}
                  </p>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="font-display text-xl font-bold leading-none tracking-tight text-foreground">
                      <NumberTicker value={balance} />
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Swaps
                    </span>
                  </div>
                </div>
              </div>

              {promoSwaps > 0 ? (
                <div className="flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-3 w-3" />
                  +{promoSwaps} bonus
                </div>
              ) : (
                <span className="text-[10px] font-bold text-muted group-hover:text-primary transition-colors">
                  Recharger &rarr;
                </span>
              )}
            </Link>
          )}
        </div>

        {showSearch && (
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2.5 rounded-[22px] border border-border bg-surface/80 px-3.5 py-2 shadow-sm backdrop-blur-xl transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
          >
            <Search className="h-4 w-4 text-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-foreground outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              className={cn(
                "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all",
                query.trim()
                  ? "bg-primary text-white shadow-cta"
                  : "bg-surface-raised text-muted"
              )}
            >
              OK
            </button>
          </form>
        )}
      </div>
    </motion.header>
  );
}
