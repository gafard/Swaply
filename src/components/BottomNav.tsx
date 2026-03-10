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
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 px-2 pt-2.5 pb-[env(safe-area-inset-bottom,20px)] sm:pb-3 flex justify-between items-end z-50 shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
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
                  className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(79,70,229,0.4)] border-4 border-white"
                >
                  <Plus className="w-8 h-8 text-white" strokeWidth={3} />
                </motion.div>
                <span className={cn(
                  "text-[10px] absolute -bottom-6 left-1/2 -translate-x-1/2 font-black uppercase tracking-widest whitespace-nowrap transition-colors",
                  isActive ? "text-indigo-600" : "text-slate-400"
                )}>
                  {item.label}
                </span>
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
            <div className="flex flex-col items-center gap-1 transition-all duration-300">
              <div className="relative">
                <item.icon 
                  className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    isActive 
                      ? "text-indigo-600" 
                      : "text-slate-300 group-hover:text-slate-500"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                {isActive && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-600 rounded-full border border-white"
                  />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tighter transition-colors duration-300",
                isActive ? "text-indigo-600" : "text-slate-400"
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
