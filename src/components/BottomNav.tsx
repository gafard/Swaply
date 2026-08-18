"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("bottomNav");
  const cleanPathname = stripLocalePrefix(pathname);

  const navItems = useMemo(
    () => [
      { href: "/", label: t("explore"), icon: Compass },
      { href: "/discover", label: t("discover"), icon: LayoutGrid },
      { href: "/publish", label: t("publish"), icon: Plus, isAction: true },
      { href: "/messages", label: t("messages"), icon: MessageSquare },
      { href: "/profile", label: t("profile"), icon: User },
    ],
    [t]
  );

  useEffect(() => {
    navItems.forEach((item) => {
      router.prefetch(localizeHref(locale, item.href));
    });
  }, [locale, navItems, router]);

  const isDetailPage = cleanPathname.startsWith("/item/") || cleanPathname.startsWith("/exchange/");
  if (isDetailPage) return null;

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 sm:px-6">
      <div className="pointer-events-auto mx-auto max-w-md">
        <div className="relative overflow-visible rounded-[32px] border border-border bg-surface/90 px-2.5 pb-2 pt-1.5 shadow-xl backdrop-blur-2xl">
          {/* Subtle Highlight Glow */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

          <div className="flex items-end justify-between gap-1">
            {navItems.map((item) => {
              const isActive =
                cleanPathname === item.href ||
                (item.href !== "/" && cleanPathname.startsWith(`${item.href}/`)) ||
                (item.href === "/messages" && cleanPathname.startsWith("/exchange/"));
              const href = localizeHref(locale, item.href);

              if (item.isAction) {
                return (
                  <Link key={item.href} href={href} prefetch className="flex flex-1 justify-center">
                    <div className="relative -mt-4 flex flex-col items-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 450, damping: 18 }}
                        className={cn(
                          "relative flex h-14 w-14 items-center justify-center rounded-[22px] border-4 border-surface bg-gradient-to-tr from-emerald-400 via-teal-500 to-purple-600 shadow-cta"
                        )}
                      >
                        <Plus className="relative z-10 h-7 w-7 text-white" strokeWidth={3.5} />
                      </motion.div>
                      <span
                        className={cn(
                          "mt-1 text-[8px] font-black uppercase tracking-widest transition-colors",
                          isActive ? "text-emerald-500" : "text-muted"
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
                  prefetch
                  className="group flex flex-1 items-end justify-center"
                >
                  <div className="relative flex w-full max-w-[68px] flex-col items-center gap-0.5 rounded-[20px] px-2 py-1.5 transition-all">
                    {isActive && (
                      <motion.div
                        layoutId="bottom-nav-active-pill"
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute inset-0 rounded-[20px] border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15"
                      />
                    )}

                    <div className="relative z-10 flex flex-col items-center gap-0.5">
                      <div
                        className={cn(
                          "relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                          isActive ? "text-emerald-500 scale-110" : "text-muted group-hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className="h-4.5 w-4.5"
                          strokeWidth={isActive ? 2.8 : 2}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-[8px] font-black uppercase tracking-wider transition-colors duration-200",
                          isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-muted"
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
