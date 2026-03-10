"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Search, Hexagon } from "lucide-react";

export default function TopNav({ unreadCount, user }: { unreadCount: number, user: any }) {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/80 backdrop-blur-xl px-5 pt-10 pb-6 sticky top-0 z-40 border-b border-gray-100/30"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
           <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Bonjour, {user?.username || "Ami"} 👋</span>
           <div className="flex items-center gap-1.5 mt-0.5">
             <span className="text-2xl font-black text-slate-900 tracking-tight">{user?.credits || 0}</span>
             <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Crédits</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/notifications" className="relative group">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white shadow-sm border border-slate-100 p-2.5 rounded-2xl"
                >
                  <Bell className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-600 rounded-full border-2 border-white" />
                  )}
                </motion.div>
              </Link>
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-slate-200">
                {user?.username?.charAt(0) || "S"}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/login" 
                className="text-[11px] font-black text-slate-600 uppercase tracking-widest px-3 py-2 hover:text-indigo-600 transition-colors"
              >
                Connexion
              </Link>
              <Link 
                href="/signup" 
                className="text-[11px] font-black text-white bg-indigo-600 uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg shadow-indigo-100 active:scale-95 transition-all"
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
          className="flex-1 bg-slate-50 border border-transparent focus-within:bg-white focus-within:border-indigo-100 focus-within:ring-4 focus-within:ring-indigo-50/50 rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all duration-300 shadow-inner"
        >
          <Search className="w-5 h-5 text-slate-400" strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search items, categories..." 
            className="bg-transparent border-none outline-none w-full text-[14px] font-semibold text-slate-800 placeholder:text-slate-400"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
