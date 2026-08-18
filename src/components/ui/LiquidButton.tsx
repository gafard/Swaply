"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiquidButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "glass" | "ghost" | "gold";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export default function LiquidButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  className,
  disabled,
  ...props
}: LiquidButtonProps) {
  const variantStyles = {
    primary:
      "bg-primary text-white hover:bg-primary-hover shadow-cta active:shadow-sm",
    secondary:
      "bg-foreground text-background hover:opacity-90 active:scale-[0.98]",
    glass:
      "bg-surface/80 border border-border text-foreground hover:bg-surface hover:border-border-focus backdrop-blur-xl shadow-sm",
    ghost:
      "bg-transparent text-foreground-muted hover:text-foreground hover:bg-surface-raised",
    gold: "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md hover:brightness-110",
  };

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-xl gap-1.5 font-bold",
    md: "px-5 py-2.5 text-sm rounded-2xl gap-2 font-bold",
    lg: "px-6 py-3.5 text-base rounded-2xl gap-2.5 font-black uppercase tracking-wider",
    xl: "px-8 py-4 text-base rounded-[22px] gap-3 font-black uppercase tracking-widest",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-60 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
}
