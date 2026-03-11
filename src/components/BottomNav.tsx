"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { 
  Compass, 
  Plus, 
  MessageSquare, 
  User,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { localizeHref, stripLocalePrefix } from "@/lib/i18n/pathnames";

export default function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("bottomNav");
  const cleanPathname = stripLocalePrefix(pathname);

  const navItems = [
    { href: "/", label: t("explore"), icon: Compass },
    { href: "/discover", label: t("discover"), icon: LayoutGrid },
    { href: "/publish", label: t("publish"), icon: Plus, isAction: true },
    { href: "/messages", label: t("messages"), icon: MessageSquare },
    { href: "/profile", label: t("profile"), icon: User },
  ];

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 sm:px-5">
      <div className="pointer-events-auto mx-auto max-w-md">
        <div className="relative overflow-visible rounded-[32px] border border-white/75 bg-[#fffaf2]/92 px-2 pb-2.5 pt-1.5 shadow-[0_24px_60px_rgba(16,32,58,0.14)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-16 w-28 -translate-x-1/2 rounded-full bg-blue-100/55 blur-3xl" />

          <div className="flex items-end justify-between gap-1">
            {navItems.map((item) => {
              const isActive =
                cleanPathname === item.href ||
                (item.href !== "/" && cleanPathname.startsWith(`${item.href}/`)) ||
                (item.href === "/messages" && cleanPathname.startsWith("/exchange/"));
              const href = localizeHref(locale, item.href);

              if (item.isAction) {
                return (
                  <Link key={item.href} href={href} className="flex flex-1 justify-center">
                    <div className="relative -mt-3.5 flex flex-col items-center">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "relative flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-[24px] border-4 border-[#fffaf2] bg-gradient-to-br shadow-[0_18px_42px_rgba(36,87,255,0.32)]",
                          isActive
                            ? "from-[#163fb8] via-[#2457ff] to-[#79b7ff]"
                            : "from-[#2457ff] via-[#3d6bff] to-[#7ebdff]"
                        )}
                      >
                        <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
                        <Plus className="relative z-10 h-7 w-7 text-white" strokeWidth={3} />
                      </motion.div>
                      <span
                        className={cn(
                          "mt-1.5 text-[9px] font-black uppercase tracking-[0.14em] transition-colors",
                          isActive ? "text-primary" : "text-slate-500"
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={href}
                  className="group flex flex-1 items-end justify-center"
                >
                  <div
                    className={cn(
                      "relative flex w-full max-w-[70px] flex-col items-center gap-0.5 rounded-[20px] px-2 py-2 transition-all duration-300",
                      isActive
                        ? "bg-white shadow-[0_14px_34px_rgba(16,32,58,0.1)]"
                        : "hover:bg-white/60"
                    )}
                  >
                    {isActive ? (
                      <motion.div
                        layoutId="bottom-nav-active-pill"
                        className="absolute inset-0 rounded-[20px] border border-white/90 bg-white/95 shadow-[0_14px_34px_rgba(16,32,58,0.08)]"
                      />
                    ) : null}

                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "relative flex h-8.5 w-8.5 items-center justify-center rounded-[14px] transition-all duration-300",
                          isActive ? "bg-[#edf3ff] text-primary" : "text-slate-300 group-hover:text-slate-500"
                        )}
                      >
                        <item.icon
                          className="h-4.5 w-4.5"
                          strokeWidth={isActive ? 2.6 : 2.2}
                        />
                        {isActive ? (
                          <motion.div
                            layoutId="active-dot"
                            className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full border border-[#fffaf2] bg-primary"
                          />
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          "text-[8px] font-black uppercase tracking-[0.14em] transition-colors duration-300",
                          isActive ? "text-primary" : "text-slate-500"
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
