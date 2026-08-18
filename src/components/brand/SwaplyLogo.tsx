"use client";

import React from "react";
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
  size = 42,
  showText = false,
  className,
  animate = false,
}: SwaplyLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <motion.div
        whileHover={animate ? { scale: 1.06, rotate: 4 } : undefined}
        whileTap={animate ? { scale: 0.94 } : undefined}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center shrink-0"
      >
        {/* Ambient Glow Aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-indigo-500 to-pink-500 blur-md opacity-40 dark:opacity-60" />
        
        {/* Kinetic Orb Vector */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full drop-shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
        >
          <defs>
            <linearGradient id="swaply-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="swaply-grad-2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Squircle Container */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="28"
            className="fill-surface stroke-border/60 dark:fill-surface-raised dark:stroke-border"
            strokeWidth="1.5"
          />

          {/* The Intersecting Kinetic Infinity Swaps Loop */}
          <path
            d="M32 38C32 28 42 22 52 24C62 26 68 34 68 44C68 56 46 60 40 70C36 76 42 82 50 82C60 82 66 74 66 74"
            stroke="url(#swaply-grad-1)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M68 62C68 72 58 78 48 76C38 74 32 66 32 56C32 44 54 40 60 30C64 24 58 18 50 18C40 18 34 26 34 26"
            stroke="url(#swaply-grad-2)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Central Energy Spark */}
          <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" className="drop-shadow-sm" />
        </svg>
      </motion.div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-display text-xl font-bold tracking-tight leading-none text-foreground">
            Swaply<span className="text-primary font-black">.</span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">
            The Swap Economy
          </span>
        </div>
      )}
    </div>
  );
}
