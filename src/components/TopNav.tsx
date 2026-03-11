"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Search } from "lucide-react";

import AppLogo from "@/components/AppLogo";
import { localizeHref } from "@/lib/i18n/pathnames";
import { cn } from "@/lib/utils";

export default function TopNav({
  unreadCount,
  user,
  showGuestActions = true,
  showSearch = true,
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
  const balance = user?.swaps ?? user?.credits ?? 0;
  const notificationLabel = String(unreadCount).padStart(2, "0");
  const hasGuestActions = !user && showGuestActions;

  useEffect(() => {
    const routes = user
      ? ["/", "/notifications", "/discover", "/publish", "/messages", "/profile"]
      : ["/", "/login", "/signup", "/discover"];

    routes.forEach((route) => {
      router.prefetch(localizeHref(locale, route));
    });
  }, [locale, router, user]);

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 border-b border-white/70 bg-[#f8f2e9]/82 px-5 pb-4 pt-6 backdrop-blur-2xl sm:pb-6 sm:pt-8"
    >
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />

      <div className="mb-4 space-y-3 sm:mb-5 sm:space-y-4">
        <div className="paper-panel relative overflow-hidden rounded-[34px] p-3.5 sm:p-5">
          <div className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="pointer-events-none absolute left-8 top-0 h-px w-24 bg-gradient-to-r from-white/0 via-white/90 to-white/0" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <Link href={localizeHref(locale, "/")} prefetch className="shrink-0">
                <AppLogo
                  size={48}
                  className="h-12 w-12 sm:h-[54px] sm:w-[54px]"
                  priority
                />
              </Link>
              <div className="min-w-0 pt-1">
                <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {t("hello")}
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <h1 className="truncate font-display text-[1.58rem] font-bold leading-none tracking-[-0.05em] text-slate-950 sm:text-[1.72rem]">
                    {user?.username || t("friend")}
                  </h1>
                  <span className="text-base">👋</span>
                </div>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-3 pt-1">
                <Link href={localizeHref(locale, "/notifications")} prefetch className="relative group">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex h-12 min-w-12 items-center justify-center rounded-[20px] border border-white/80 bg-white/85 px-3 shadow-[0_14px_34px_rgba(16,32,58,0.1)]"
                  >
                    <Bell className="h-5 w-5 text-foreground" strokeWidth={2.5} />
                    {unreadCount > 0 ? (
                      <span className="absolute -right-1 -top-1 min-w-[22px] rounded-full border-2 border-[#fffaf2] bg-[#ff6b57] px-1.5 py-0.5 text-[9px] font-black text-white">
                        {notificationLabel}
                      </span>
                    ) : null}
                  </motion.div>
                </Link>
                <div className="flex h-12 w-12 items-center justify-center rounded-[24px] bg-[#10203a] text-sm font-bold uppercase text-white shadow-[0_12px_30px_rgba(16,32,58,0.28)]">
                  {user?.username?.charAt(0) || "S"}
                </div>
              </div>
            ) : null}
          </div>

          {showBalance && (
            <div className="relative mt-4 grid gap-3 justify-items-center sm:mt-5">
              <div
                className="w-full max-w-[22rem] rounded-[28px] border border-white/80 bg-white/88 px-4 py-3.5 text-center shadow-[0_14px_36px_rgba(16,32,58,0.06)] sm:py-4"
              >
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {t("balance")}
                </span>
                <div className="mt-1.5 flex min-w-0 items-end justify-center gap-2 sm:mt-2">
                  <span className="font-display text-[2.8rem] font-bold leading-none tracking-[-0.06em] text-slate-950 sm:text-[3.15rem]">
                    {balance}
                  </span>
                  <span className="capsule-outline mb-1 inline-flex items-center gap-2 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#8d6515] sm:px-4 sm:py-2 sm:text-[11px]">
                    Swaps
                    <span className="text-[#f29e29]">✦</span>
                  </span>
                </div>
              </div>

              {hasGuestActions ? (
                <div className="flex shrink-0 items-center gap-2 self-center">
                  <Link
                    href={localizeHref(locale, "/login")}
                    prefetch
                    className="rounded-full border border-slate-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-slate-900"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href={localizeHref(locale, "/signup")}
                    prefetch
                    className="rounded-full bg-[#2457ff] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(36,87,255,0.28)] transition-all active:scale-95"
                  >
                    {t("signup")}
                  </Link>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {showSearch ? (
        <div className="relative overflow-hidden rounded-[34px] border border-white/80 bg-[#fffaf3] px-4 py-3.5 shadow-[0_18px_44px_rgba(16,32,58,0.08)] sm:py-4">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-blue-100/40 to-transparent" />
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative z-10 flex items-center gap-3 rounded-[26px] border border-slate-200/70 bg-white/80 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 focus-within:border-slate-400 sm:py-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-[#f2f5ff] text-primary shadow-inner">
              <Search className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="w-full border-none bg-transparent text-[15px] font-semibold text-foreground outline-none placeholder:text-slate-400"
            />
          </motion.div>
        </div>
      ) : null}
    </motion.div>
  );
}
