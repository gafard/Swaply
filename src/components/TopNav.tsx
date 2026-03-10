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

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-background/80 backdrop-blur-xl px-5 pt-10 pb-6 sticky top-0 z-40 border-b border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={localizeHref(locale, "/")} className="shrink-0">
            <AppLogo
              size={44}
              className="h-11 w-11 rounded-2xl border border-slate-200 bg-white shadow-sm"
              priority
            />
          </Link>
          <div className="flex flex-col">
             <span className="text-muted text-[11px] font-bold uppercase tracking-wider">
               {t("greeting", {name: user?.username || t("friend")})}
             </span>
             <div className="flex items-center gap-2 mt-0.5">
               <span className="text-2xl font-black text-foreground tracking-tighter">{user?.swaps ?? user?.credits ?? 0}</span>
               <span className="text-[10px] font-black text-[#854d0e] bg-[#fefce8] border border-[#fef08a] px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Swaps ✨</span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href={localizeHref(locale, "/notifications")} className="relative group">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-surface shadow-sm border border-border p-2.5 rounded-2xl"
                >
                  <Bell className="w-5 h-5 text-foreground" strokeWidth={2.5} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-surface" />
                  )}
                </motion.div>
              </Link>
              <div className="w-10 h-10 rounded-2xl bg-foreground flex items-center justify-center text-white font-bold text-sm uppercase shadow-card">
                {user?.username?.charAt(0) || "S"}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href={localizeHref(locale, "/login")} 
                className="text-[11px] font-bold text-muted uppercase tracking-widest px-3 py-2 hover:text-primary transition-colors"
              >
                {t("login")}
              </Link>
              <Link 
                href={localizeHref(locale, "/signup")} 
                className="text-[11px] font-bold text-white bg-primary uppercase tracking-widest px-5 py-2.5 rounded-2xl shadow-cta active:scale-95 transition-all"
              >
                {t("signup")}
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-surface border border-border focus-within:border-slate-400 rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all duration-300 shadow-sm"
        >
          <Search className="w-5 h-5 text-slate-400" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder={t("searchPlaceholder")} 
            className="bg-transparent border-none outline-none w-full text-sm font-medium text-foreground placeholder:text-muted"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
