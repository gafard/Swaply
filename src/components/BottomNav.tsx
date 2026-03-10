"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Compass, 
  Plus, 
  MessageSquare, 
  User,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Explorer", icon: Compass },
    { href: "/discover", label: "Découvrir", icon: LayoutGrid },
    { href: "/publish", label: "Publier", icon: Plus, isAction: true },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/profile", label: "Profil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-surface border-t border-border px-2 pt-2.5 pb-[env(safe-area-inset-bottom,20px)] sm:pb-3 flex justify-between items-end z-50 shadow-card">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`)) ||
          (item.href === "/messages" && pathname.startsWith("/exchange/"));

        if (item.isAction) {
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center">
              <div className="relative -top-5">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-cta border-4 border-surface"
                >
                  <Plus className="w-8 h-8 text-white" strokeWidth={3} />
                </motion.div>
                <p className={cn(
                  "text-[10px] absolute -bottom-6 left-1/2 -translate-x-1/2 font-bold uppercase tracking-wider whitespace-nowrap transition-colors",
                  isActive ? "text-primary" : "text-muted"
                )}>
                  {item.label}
                </p>
              </div>
            </Link>
          );
        }

        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className="flex-1 flex flex-col items-center justify-center pb-1 group"
          >
            <div className="flex flex-col items-center gap-1.5 transition-all duration-300">
              <div className="relative">
                <item.icon 
                  className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    isActive 
                      ? "text-primary" 
                      : "text-slate-300 group-hover:text-muted"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                {isActive && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full border border-surface"
                  />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tight transition-colors duration-300",
                isActive ? "text-primary" : "text-muted"
              )}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
