"use client";

import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ErrorViewProps {
  title: string;
  subtitle: string;
  actionHref?: string;
  actionLabel?: string;
  onRetry?: () => void;
  secondaryActionHref?: string;
  secondaryActionLabel?: string;
  className?: string;
}

export default function ErrorView({
  title,
  subtitle,
  actionHref,
  actionLabel,
  onRetry,
  secondaryActionHref,
  secondaryActionLabel,
  className,
}: ErrorViewProps) {
  return (
    <div className={cn("fixed inset-0 z-[100] flex items-center justify-center bg-white p-6", className)}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
        className="w-full max-w-sm text-center"
      >
        <div className="relative mx-auto mb-10 flex h-32 w-32 items-center justify-center">
          {/* Animated concentric rings (Rose/Danger theme) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2 border-rose-500/20"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
            className="absolute inset-0 rounded-full border-2 border-rose-500/10"
          />
          
          {/* Main error circle with "Error" Shake animation */}
          <motion.div
            initial={{ scale: 0, rotate: 10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20, 
              delay: 0.1 
            }}
            className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-rose-500 shadow-[0_20px_50px_rgba(244,63,94,0.4)]"
          >
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: [0, -5, 5, -5, 5, 0] }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <XCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
            </motion.div>
          </motion.div>
        </div>

        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="font-display text-4xl font-extrabold tracking-tight text-slate-950 mb-4"
        >
          {title}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-[15px] font-medium leading-relaxed text-slate-500 mb-12 px-4"
        >
          {subtitle}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-4"
        >
          {onRetry ? (
            <button
              onClick={onRetry}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[28px] bg-[#10203a] py-5 font-black text-white shadow-[0_20px_40px_rgba(16,32,58,0.25)] transition-all active:scale-[0.98] hover:bg-[#1a2e4d]"
            >
              <RefreshCcw className="h-5 w-5 transition-transform group-hover:rotate-180 duration-700" />
              Ressayer
            </button>
          ) : actionHref && actionLabel ? (
            <Link
              href={actionHref}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[28px] bg-[#10203a] py-5 font-black text-white shadow-[0_20px_40px_rgba(16,32,58,0.25)] transition-all active:scale-[0.98] hover:bg-[#1a2e4d]"
            >
              {actionLabel}
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1.5" />
            </Link>
          ) : null}

          {secondaryActionHref && secondaryActionLabel && (
            <Link
              href={secondaryActionHref}
              className="block w-full rounded-[28px] border-2 border-slate-100 bg-white py-5 text-center text-sm font-black text-slate-900 transition-all active:scale-[0.98] hover:bg-slate-50 hover:border-slate-200"
            >
              {secondaryActionLabel}
            </Link>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
