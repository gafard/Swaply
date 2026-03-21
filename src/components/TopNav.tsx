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
      className="sticky top-0 z-40 px-5 pb-3 pt-4 backdrop-blur-2xl sm:pb-4 sm:pt-6"
    >
      <div className="mx-auto max-w-md space-y-3">
        <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,252,247,0.82))] p-3.5 shadow-[0_22px_54px_rgba(16,32,58,0.08)]">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="pointer-events-none absolute -right-6 top-1 h-16 w-16 rounded-full bg-[#2457ff]/8 blur-2xl" />
          <div className="pointer-events-none absolute -left-6 bottom-0 h-16 w-16 rounded-full bg-[#ffb16a]/10 blur-2xl" />
          <div className="relative flex items-center justify-between gap-3">
            <Link href={localizeHref(locale, "/")} prefetch className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <AppLogo size={40} className="h-10 w-10 shrink-0 drop-shadow-[0_8px_18px_rgba(36,87,255,0.18)]" priority />
                <div className="min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-[#2457ff]/72">
                    Swaply
                  </span>
                  <p className="mt-0.5 truncate font-display text-[1.12rem] font-bold tracking-[-0.05em] text-foreground">
                    {user?.username ? `${t("hello")}, ${user.username}` : "Swaply"}
                  </p>
                </div>
              </div>
            </Link>

            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href={localizeHref(locale, "/notifications")}
                  prefetch
                  className="relative flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/70 bg-white/80 text-foreground shadow-[0_12px_24px_rgba(16,32,58,0.08)]"
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
                  className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,#10203a,#2457ff)] text-sm font-black uppercase text-white shadow-[0_16px_30px_rgba(16,32,58,0.2)]"
                >
                  {user?.username?.charAt(0) || "S"}
                </Link>
              </div>
            ) : hasGuestActions ? (
              <div className="flex items-center gap-2">
                <Link
                  href={localizeHref(locale, "/login")}
                  prefetch
                  className="rounded-full border border-white/80 bg-white/80 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-muted shadow-sm"
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
            <div className="relative mt-3 flex items-center justify-between gap-3 overflow-hidden rounded-[24px] border border-[#e7ddcf] bg-[linear-gradient(135deg,#fff8ee,#fffdf8)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <div className="pointer-events-none absolute -right-5 top-0 h-16 w-16 rounded-full bg-[#ffb16a]/10 blur-2xl" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[linear-gradient(145deg,#fff3d8,#ffe2a8)] text-amber-700 shadow-[0_10px_20px_rgba(255,177,106,0.18)]">
                  <Wallet className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9a7b3b]">
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
                <div className="rounded-full border border-amber-200/80 bg-white/80 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-amber-700 shadow-sm">
                  +{promoSwaps} bonus
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {showSearch ? (
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-3 rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,252,247,0.84))] px-4 py-3 shadow-[0_18px_42px_rgba(16,32,58,0.06)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[linear-gradient(145deg,#edf3ff,#f6f9ff)] text-primary shadow-sm">
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
                query.trim() ? "bg-primary text-white shadow-[0_10px_24px_rgba(36,87,255,0.22)]" : "bg-slate-100 text-slate-500"
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
