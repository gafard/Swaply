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
  size = 44,
  showText = false,
  className,
  animate = false,
  priority = false,
}: SwaplyLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <motion.div
        whileHover={animate ? { scale: 1.08, rotate: 2 } : undefined}
        whileTap={animate ? { scale: 0.94 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden shadow-[0_8px_25px_rgba(59,130,246,0.35)]"
      >
        {/* Glow ambient background behind logo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 blur-sm opacity-50" />

        <img
          src="/logo-swaply-3d.png"
          alt="Swaply"
          width={size}
          height={size}
          className="relative z-10 w-full h-full object-cover rounded-2xl"
        />
      </motion.div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-display text-xl font-black tracking-tight leading-none text-foreground flex items-center gap-0.5">
            SWAPLY<span className="text-primary text-2xl leading-none">.</span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted mt-0.5">
            Circular Luxury
          </span>
        </div>
      )}
    </div>
  );
}
