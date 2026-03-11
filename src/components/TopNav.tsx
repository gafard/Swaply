"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Search } from "lucide-react";

import AppLogo from "@/components/AppLogo";
import { localizeHref } from "@/lib/i18n/pathnames";

export default function TopNav({ unreadCount, user }: { unreadCount: number, user: any }) {
  const locale = useLocale();
  const t = useTranslations("topNav");
  const balance = user?.swaps ?? user?.credits ?? 0;

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 border-b border-white/70 bg-[#f8f2e9]/80 px-5 pb-6 pt-8 backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />

      <div className="mb-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <Link href={localizeHref(locale, "/")} className="shrink-0 rounded-[26px] paper-panel p-2.5">
              <AppLogo
                size={50}
                className="h-12 w-12 rounded-[20px] bg-white"
                priority
              />
            </Link>
            <div className="min-w-0 pt-1">
              <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                {t("hello")}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <h1 className="truncate font-display text-[1.65rem] font-bold leading-none tracking-[-0.05em] text-slate-950">
                  {user?.username || t("friend")}
                </h1>
                <span className="text-base">👋</span>
              </div>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-3 pt-1">
              <Link href={localizeHref(locale, "/notifications")} className="relative group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="capsule-outline p-3"
                >
                  <Bell className="h-5 w-5 text-foreground" strokeWidth={2.5} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#fffaf2] bg-[#ff6b57]" />
                  )}
                </motion.div>
              </Link>
              <div className="flex h-11 w-11 items-center justify-center rounded-[22px] bg-[#10203a] text-sm font-bold uppercase text-white shadow-[0_12px_30px_rgba(16,32,58,0.28)]">
                {user?.username?.charAt(0) || "S"}
              </div>
            </div>
          ) : null}
        </div>

        <div className="paper-panel flex items-end justify-between gap-3 rounded-[30px] px-4 py-4">
          <div className="min-w-0">
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {t("balance")}
            </span>
            <div className="mt-2 flex min-w-0 items-end gap-2">
              <span className="font-display text-[3.15rem] font-bold leading-none tracking-[-0.06em] text-slate-950">
                {balance}
              </span>
              <span className="capsule-outline mb-1 inline-flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#8d6515]">
                Swaps
                <span className="text-[#f29e29]">✦</span>
              </span>
            </div>
          </div>

          {!user ? (
            <div className="flex shrink-0 items-center gap-2 self-center">
              <Link
                href={localizeHref(locale, "/login")}
                className="rounded-full border border-slate-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-slate-900"
              >
                {t("login")}
              </Link>
              <Link
                href={localizeHref(locale, "/signup")}
                className="rounded-full bg-[#2457ff] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(36,87,255,0.28)] transition-all active:scale-95"
              >
                {t("signup")}
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-[#fffaf3] px-4 py-4 shadow-[0_16px_40px_rgba(16,32,58,0.08)]">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-blue-100/40 to-transparent" />
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="relative z-10 flex items-center gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 focus-within:border-slate-400"
        >
          <Search className="w-5 h-5 text-slate-400" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder={t("searchPlaceholder")} 
            className="w-full border-none bg-transparent text-[15px] font-semibold text-foreground outline-none placeholder:text-slate-400"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
