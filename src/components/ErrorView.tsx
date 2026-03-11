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
    <div className={cn("fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-xl p-6", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          {/* Pulsing rings (Danger theme) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2 border-rose-400/30"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            className="absolute inset-0 rounded-full border-2 border-rose-400/20"
          />
          
          {/* Main error circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-rose-500 shadow-[0_12px_44px_rgba(244,63,94,0.4)]"
          >
            <motion.div
              animate={{ 
                x: [0, -4, 4, -4, 4, 0],
              }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <XCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
            </motion.div>
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-display text-3xl font-bold tracking-tight text-slate-950 mb-4"
        >
          {title}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm font-medium leading-6 text-slate-500 mb-10"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {onRetry ? (
            <button
              onClick={onRetry}
              className="group flex w-full items-center justify-center gap-2 rounded-[24px] bg-slate-900 py-4 font-black text-white shadow-[0_16px_36px_rgba(16,32,58,0.2)] transition-all active:scale-[0.98] hover:bg-slate-800"
            >
              <RefreshCcw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
              Ressayer
            </button>
          ) : actionHref && actionLabel ? (
            <Link
              href={actionHref}
              className="group flex w-full items-center justify-center gap-2 rounded-[24px] bg-slate-900 py-4 font-black text-white shadow-[0_16px_36px_rgba(16,32,58,0.2)] transition-all active:scale-[0.98] hover:bg-slate-800"
            >
              {actionLabel}
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          ) : null}

          {secondaryActionHref && secondaryActionLabel && (
            <Link
              href={secondaryActionHref}
              className="block w-full rounded-[24px] border border-slate-200 bg-white py-4 text-center text-sm font-black text-slate-900 transition-all active:scale-[0.98] hover:bg-slate-50"
            >
              {secondaryActionLabel}
            </Link>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
