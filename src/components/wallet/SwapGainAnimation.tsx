"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface SwapGainAnimationProps {
  amount: number;
  show: boolean;
  onComplete: () => void;
}

export default function SwapGainAnimation({
  amount,
  show,
  onComplete,
}: SwapGainAnimationProps) {
  const [particleConfigs, setParticleConfigs] = useState<Array<{ id: number; distance: number; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      const configs = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        distance: 80 + Math.random() * 60,
        delay: Math.random() * 0.2
      }));
      setParticleConfigs(configs);
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);


  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Backdrop Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[2px]"
          />

          {/* Main Content */}
          <div className="relative flex flex-col items-center">
            {/* Particles */}
            {particleConfigs.map((p) => {
              const angle = (p.id / particleConfigs.length) * Math.PI * 2;
              return (
                <motion.div
                  key={p.id}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(angle) * p.distance,
                    y: Math.sin(angle) * p.distance,
                    scale: [0, 1.2, 0.8],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    ease: "easeOut",
                    delay: p.delay,
                  }}
                  className="absolute"
                >
                  <Sparkles className="h-6 w-6 text-amber-400" fill="currentColor" />
                </motion.div>
              );
            })}


            {/* Central Badge */}
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -20 }}
              transition={{ type: "spring", damping: 15 }}
              className="relative rounded-[32px] bg-white p-8 shadow-[0_30px_100px_rgba(16,32,58,0.25)] border border-indigo-100 flex flex-col items-center gap-2"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 mb-2">
                <Sparkles className="h-10 w-10" />
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-amber-500 font-black text-sm uppercase tracking-[0.2em]"
              >
                Gagné !
              </motion.span>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-baseline gap-2"
              >
                <span className="font-display text-5xl font-black text-slate-900">
                  +{amount}
                </span>
                <span className="font-black text-indigo-400 uppercase tracking-widest text-xs">
                  Swaps
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
