"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

export type CreditLevel = "POWER_SWAPPER" | "TRUSTED" | "NEOPHYTE" | "ROOKIE";

interface CreditBadgeProps {
  score: number;
  className?: string;
}

export function getCreditLevel(score: number): { 
  level: CreditLevel; 
  label: string; 
  color: string; 
  icon: any;
  bg: string;
} {
  if (score >= 90) return { 
    level: "POWER_SWAPPER", 
    label: "Power Swapper", 
    color: "text-indigo-600", 
    bg: "bg-indigo-50",
    icon: ShieldCheck 
  };
  if (score >= 70) return { 
    level: "TRUSTED", 
    label: "Vérifié", 
    color: "text-emerald-600", 
    bg: "bg-emerald-50",
    icon: ShieldCheck 
  };
  if (score >= 40) return { 
    level: "NEOPHYTE", 
    label: "Actif", 
    color: "text-amber-600", 
    bg: "bg-amber-50",
    icon: Shield 
  };
  return { 
    level: "ROOKIE", 
    label: "Nouveau", 
    color: "text-slate-400", 
    bg: "bg-slate-50",
    icon: ShieldAlert 
  };
}

export default function CreditBadge({ score, className }: CreditBadgeProps) {
  const { label, color, bg, icon: Icon } = getCreditLevel(score);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/80 shadow-sm ${bg} ${className}`}
    >
      <Icon className={`w-3 h-3 ${color}`} />
      <span className={`text-[9px] font-black uppercase tracking-wider ${color}`}>
        {label}
      </span>
    </motion.div>
  );
}
