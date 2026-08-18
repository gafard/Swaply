"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwaplyVectorLogoProps {
  size?: number;
  showText?: boolean;
  showSlogan?: boolean;
  className?: string;
  animate?: boolean;
}

export default function SwaplyVectorLogo({
  size = 46,
  showText = false,
  showSlogan = false,
  className,
  animate = true,
}: SwaplyVectorLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <motion.div
        whileHover={animate ? { scale: 1.1, rotate: 4 } : undefined}
        whileTap={animate ? { scale: 0.92, rotate: -4 } : undefined}
        transition={{ type: "spring", stiffness: 450, damping: 18 }}
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center shrink-0"
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_8px_16px_rgba(16,185,129,0.3)]"
        >
          <defs>
            {/* Top Green to Cyan Gradient */}
            <linearGradient id="swaplyGreenGradient" x1="20" y1="20" x2="180" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#84CC16" />
              <stop offset="40%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Bottom Purple to Pink Gradient */}
            <linearGradient id="swaplyPinkGradient" x1="40" y1="90" x2="180" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>

            {/* Ambient Glow Filter */}
            <filter id="swaplyGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Confetti Elements */}
          {/* Top Yellow Dash */}
          <line x1="68" y1="38" x2="56" y2="28" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
          {/* Top Cyan Dash */}
          <line x1="140" y1="42" x2="152" y2="34" stroke="#06B6D4" strokeWidth="5.5" strokeLinecap="round" />
          {/* Right Magenta Dash */}
          <line x1="155" y1="62" x2="166" y2="60" stroke="#EC4899" strokeWidth="5" strokeLinecap="round" />
          {/* Left Magenta Dash */}
          <line x1="45" y1="108" x2="35" y2="114" stroke="#EC4899" strokeWidth="5.5" strokeLinecap="round" />
          {/* Bottom Yellow Dash */}
          <line x1="158" y1="110" x2="168" y2="114" stroke="#FBBF24" strokeWidth="5.5" strokeLinecap="round" />

          {/* Cyan Star Sparkle */}
          <path
            d="M36 86 C36 86, 38 92, 44 92 C38 92, 36 98, 36 98 C36 98, 34 92, 28 92 C34 92, 36 86, 36 86 Z"
            fill="#06B6D4"
          />

          {/* Purple Sparkle */}
          <path
            d="M170 66 C170 66, 172 72, 178 72 C172 72, 170 78, 170 78 C170 78, 168 72, 162 72 C168 72, 170 66, 170 66 Z"
            fill="#8B5CF6"
          />

          {/* Dark Confetti Dots */}
          <circle cx="48" cy="62" r="4.5" fill="#1E1B4B" />
          <circle cx="164" cy="88" r="4" fill="#1E1B4B" />

          {/* TOP CURVED ARROW (Emerald / Lime / Cyan) */}
          <path
            d="M 68 100 C 68 62, 94 44, 126 44 L 126 30 L 158 54 L 126 78 L 126 64 C 104 64, 88 78, 88 100 Z"
            fill="url(#swaplyGreenGradient)"
          />

          {/* BOTTOM CURVED ARROW (Purple / Pink / Magenta) */}
          <path
            d="M 132 100 C 132 138, 106 156, 74 156 L 74 170 L 42 146 L 74 122 L 74 136 C 96 136, 112 122, 112 100 Z"
            fill="url(#swaplyPinkGradient)"
          />
        </svg>
      </motion.div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-0.5">
            <span className="font-display text-2xl font-black tracking-tight leading-none text-foreground">
              Swaply
            </span>
            {/* Playful Pink Crown / Sparkle */}
            <span className="text-rose-500 font-black text-xs leading-none">///</span>
          </div>

          {/* Underline Brush */}
          <div className="h-1 w-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-lime-400 mt-1" />

          {showSlogan && (
            <span className="text-[7.5px] font-black uppercase tracking-[0.25em] text-muted mt-1">
              Troc • Connecte • Change le monde
            </span>
          )}
        </div>
      )}
    </div>
  );
}
