"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, 
  CheckCircle2, 
  LogIn, 
  Package, 
  Plus, 
  Wallet, 
  X,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export type FeedbackType = 
  | "insufficient_swaps" 
  | "own_item_forbidden" 
  | "auth_required" 
  | "unexpected_error"
  | "exchange_reserved";

interface FeedbackSheetProps {
  isOpen: boolean;
  onClose: () => void;
  type: FeedbackType;
  metadata?: {
    amount?: number;
    currentAmount?: number;
    exchangeId?: string;
  };
}


export default function FeedbackSheet({
  isOpen,
  onClose,
  type,
  metadata
}: FeedbackSheetProps) {
  const t = useTranslations("feedbackSheet");

  const getConfig = () => {
    switch (type) {
      case "insufficient_swaps":
        return {
          icon: Wallet,
          iconBg: "bg-rose-50",
          iconColor: "text-rose-500",
          badge: X,
          badgeBg: "bg-rose-500",
          ctaHref: "/wallet",
          ctaIcon: Plus,
        };
      case "own_item_forbidden":
        return {
          icon: Package,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-500",
          badge: AlertCircle,
          badgeBg: "bg-amber-500",
          ctaHref: "/profile/items",
          ctaIcon: ArrowRight,
        };
      case "auth_required":
        return {
          icon: LogIn,
          iconBg: "bg-indigo-50",
          iconColor: "text-indigo-500",
          badge: AlertCircle,
          badgeBg: "bg-indigo-500",
          ctaHref: "/login",
          ctaIcon: LogIn,
        };
      case "exchange_reserved":
        return {
          icon: CheckCircle2,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-500",
          badge: CheckCircle2,
          badgeBg: "bg-emerald-500",
          ctaHref: metadata?.exchangeId ? `/exchange/${metadata.exchangeId}` : "/messages",
          ctaIcon: MessageSquare,
        };
      default:
        return {
          icon: AlertCircle,
          iconBg: "bg-slate-50",
          iconColor: "text-slate-500",
          badge: X,
          badgeBg: "bg-slate-500",
          ctaHref: null,
          ctaIcon: Plus,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const BadgeIcon = config.badge;
  const CtaIcon = config.ctaIcon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-md overflow-hidden rounded-t-[40px] border-t border-white/40 bg-white shadow-[0_-20px_80px_rgba(16,32,58,0.15)]"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 flex justify-center pt-3">
              <div className="h-1 w-12 rounded-full bg-slate-200" />
            </div>

            <div className="px-6 pb-12 pt-10">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-[28px] ${config.iconBg} ${config.iconColor} shadow-inner`}>
                    <Icon className="h-10 w-10" />
                  </div>
                  <div className={`absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white ${config.badgeBg} text-white shadow-lg`}>
                    <BadgeIcon className="h-4 w-4" strokeWidth={3} />
                  </div>
                </div>
              </div>

              <div className="mb-10 text-center space-y-3">
                <h3 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                  {t(`${type}.title`)}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-slate-500 text-pretty px-4">
                  {t(`${type}.body`, { amount: metadata?.amount ?? 0 })}
                </p>

              </div>

              {type === "insufficient_swaps" && metadata?.amount !== undefined && (
                <div className="mb-8 grid grid-cols-2 gap-4">
                  <div className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-4 text-center">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Votre solde
                    </span>
                    <span className="font-display text-2xl font-bold text-slate-900">
                      {metadata.currentAmount ?? 0}
                    </span>
                  </div>
                  <div className="rounded-[28px] border border-rose-100 bg-rose-50/50 p-4 text-center">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-rose-400">
                      Requis
                    </span>
                    <span className="font-display text-2xl font-bold text-rose-600">
                      {metadata.amount}
                    </span>
                  </div>
                </div>
              )}


              <div className="flex flex-col gap-3">
                {config.ctaHref ? (
                  <Link
                    href={config.ctaHref}
                    className="flex items-center justify-center gap-2 rounded-[22px] bg-slate-900 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-slate-200 transition-all active:scale-95"
                    onClick={onClose}
                  >
                    <CtaIcon className="h-4 w-4" />
                    {t(`${type}.cta`)}
                  </Link>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 rounded-[22px] bg-slate-900 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-slate-200 transition-all active:scale-95"
                  >
                    {t(`${type}.cta`)}
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="rounded-[22px] border border-slate-200 bg-white py-4 text-sm font-black uppercase tracking-widest text-slate-500 transition-all active:scale-95"
                >
                  {t(`${type}.secondary`)}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
