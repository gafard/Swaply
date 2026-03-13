"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Coins, MapPin, Camera, Info, Loader2, ChevronRight } from "lucide-react";
import { getSwapAdvice } from "@/app/actions/assistant";

const ICON_MAP: Record<string, any> = {
  coins: Coins,
  "map-pin": MapPin,
  camera: Camera,
  info: Info
};

export default function SwapAssistant({ exchangeId }: { exchangeId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<any>(null);

  const fetchAdvice = async () => {
    if (advice && isOpen) {
        setIsOpen(false);
        return;
    }
    
    setLoading(true);
    setIsOpen(true);
    try {
      const res = await getSwapAdvice(exchangeId);
      setAdvice(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={fetchAdvice}
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200"
      >
        <Sparkles className="w-4 h-4" />
        Conseil IA
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-4 right-0 w-[280px] bg-white rounded-[32px] border border-gray-100 shadow-2xl overflow-hidden z-[60]"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SwapAssistant</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="py-8 flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Analyse en cours...</p>
                </div>
              ) : advice ? (
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-500 italic mb-2 leading-relaxed">
                        "{advice.summary}"
                    </p>
                  {advice.suggestions.map((s: any, i: number) => {
                    const Icon = ICON_MAP[s.icon] || Info;
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group cursor-default"
                      >
                        <div className="shrink-0 w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 leading-tight">
                          {s.text}
                        </p>
                      </motion.div>
                    );
                  })}
                  
                  <div className="pt-2">
                      <button className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group">
                          Appliquer un conseil
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                  </div>
                </div>
              ) : null}
            </div>
            
            <div className="bg-slate-50 px-5 py-3 border-t border-gray-100">
                <p className="text-[9px] text-slate-400 font-medium leading-tight">
                    L'IA peut varier. Verifiez toujours les prix et conditions par vous-même.
                </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
