"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwaplyLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  animate?: boolean;
  priority?: boolean;
}

export default function SwaplyLogo({
  size = 46,
  showText = false,
  className,
  animate = true,
  priority = false,
}: SwaplyLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <motion.div
        whileHover={animate ? { scale: 1.08, rotate: 3 } : undefined}
        whileTap={animate ? { scale: 0.92, rotate: -3 } : undefined}
        transition={{ type: "spring", stiffness: 450, damping: 18 }}
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(16,185,129,0.28)]"
      >
        <img
          src="/logo-swaply-official.png"
          alt="Swaply Logo"
          width={size}
          height={size}
          className="relative z-10 w-full h-full object-contain"
        />
      </motion.div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-display text-2xl font-black tracking-tight leading-none text-foreground flex items-center">
            Swaply
            <span className="ml-1 text-sm font-black text-rose-500 animate-pulse">✨</span>
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mt-0.5">
            Troc • Connecte • Change
          </span>
        </div>
      )}
    </div>
  );
}
