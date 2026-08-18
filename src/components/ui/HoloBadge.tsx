"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface HoloBadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "gold" | "success" | "danger" | "neutral";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export default function HoloBadge({
  children,
  variant = "primary",
  size = "md",
  icon,
  className,
  glow = false,
}: HoloBadgeProps) {
  const variantStyles = {
    primary:
      "border-primary/20 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15",
    gold: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-400",
    success:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-400",
    danger:
      "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:border-rose-400/30 dark:bg-rose-400/15 dark:text-rose-400",
    neutral:
      "border-border bg-surface-raised/80 text-foreground-muted dark:bg-surface-raised/50",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3.5 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold uppercase tracking-wider backdrop-blur-md transition-all",
        variantStyles[variant],
        sizeStyles[size],
        glow && "shadow-sm",
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
