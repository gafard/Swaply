"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Search, Wallet } from "lucide-react";

import AppLogo from "@/components/AppLogo";
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
      className="sticky top-0 z-40 border-b border-border/60 bg-background/88 px-5 pb-3 pt-4 backdrop-blur-2xl sm:pb-4 sm:pt-6"
    >
      <div className="mx-auto max-w-md space-y-3">
        <div className="rounded-[30px] border border-border bg-surface/90 p-3.5 shadow-[0_18px_48px_rgba(16,32,58,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <Link href={localizeHref(locale, "/")} prefetch className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-border bg-white shadow-[0_8px_18px_rgba(16,32,58,0.06)]">
                  <AppLogo size={34} className="h-[34px] w-[34px]" priority />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-muted/70">
                    Swaply
                  </span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="truncate font-display text-[1.05rem] font-bold tracking-[-0.04em] text-foreground">
                      {user?.username ? `${t("hello")}, ${user.username}` : "Swaply"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href={localizeHref(locale, "/notifications")}
                  prefetch
                  className="relative flex h-11 w-11 items-center justify-center rounded-[18px] border border-border bg-background text-foreground shadow-sm"
                  aria-label="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" strokeWidth={2.4} />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full border-2 border-background bg-rose-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                      {notificationLabel}
                    </span>
                  ) : null}
                </Link>
                <Link
                  href={localizeHref(locale, "/profile")}
                  prefetch
                  className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-foreground text-sm font-black uppercase text-background shadow-[0_12px_24px_rgba(16,32,58,0.22)]"
                >
                  {user?.username?.charAt(0) || "S"}
                </Link>
              </div>
            ) : hasGuestActions ? (
              <div className="flex items-center gap-2">
                <Link
                  href={localizeHref(locale, "/login")}
                  prefetch
                  className="rounded-full border border-border bg-background px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-muted"
                >
                  {t("login")}
                </Link>
                <Link
                  href={localizeHref(locale, "/signup")}
                  prefetch
                  className="rounded-full bg-[#2457ff] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_rgba(36,87,255,0.24)]"
                >
                  {t("signup")}
                </Link>
              </div>
            ) : null}
          </div>

          {showBalance && user ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-[22px] border border-border bg-background/70 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-amber-50 text-amber-600">
                  <Wallet className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted/70">
                    {t("balance")}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-display text-[1.5rem] font-bold leading-none tracking-[-0.05em] text-foreground">
                      {balance}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
                      Swaps
                    </span>
                  </div>
                </div>
              </div>
              {promoSwaps > 0 ? (
                <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-amber-700">
                  +{promoSwaps} bonus
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {showSearch ? (
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-3 rounded-[26px] border border-border bg-surface/90 px-4 py-3 shadow-[0_16px_40px_rgba(16,32,58,0.06)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-primary/8 text-primary">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted/70"
            />
            <button
              type="submit"
              className={cn(
                "rounded-full px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-colors",
                query.trim() ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
              )}
            >
              Go
            </button>
          </form>
        ) : null}
      </div>
    </motion.header>
  );
}
