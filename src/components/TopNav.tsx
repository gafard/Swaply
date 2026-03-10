"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Search, Hexagon } from "lucide-react";

export default function TopNav({ unreadCount, user }: { unreadCount: number, user: any }) {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-background/80 backdrop-blur-xl px-5 pt-10 pb-6 sticky top-0 z-40 border-b border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
           <span className="text-muted text-[11px] font-bold uppercase tracking-wider">Bonjour, {user?.username || "Ami"} 👋</span>
           <div className="flex items-center gap-2 mt-0.5">
             <span className="text-2xl font-semibold text-foreground tracking-tight">{user?.credits || 0}</span>
             <span className="text-[10px] font-bold text-primary bg-[#EEF2FF] px-2.5 py-1 rounded-full uppercase tracking-tight">Crédits</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/notifications" className="relative group">
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
                href="/login" 
                className="text-[11px] font-bold text-muted uppercase tracking-widest px-3 py-2 hover:text-primary transition-colors"
              >
                Connexion
              </Link>
              <Link 
                href="/signup" 
                className="text-[11px] font-bold text-white bg-primary uppercase tracking-widest px-5 py-2.5 rounded-2xl shadow-cta active:scale-95 transition-all"
              >
                S&apos;inscrire
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
            placeholder="Rechercher un objet, une catégorie..." 
            className="bg-transparent border-none outline-none w-full text-sm font-medium text-foreground placeholder:text-muted"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
