"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, MinusCircle, PlusCircle, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { reserveItem } from "@/app/actions/exchange";
import { localizeHref } from "@/lib/i18n/pathnames";
import { cn } from "@/lib/utils";
import FeedbackSheet, { FeedbackType } from "../FeedbackSheet";



interface ReserveButtonProps {
  itemId: string;
  itemTitle: string;
  isDefective: boolean;
  userSwaps: number;
  itemPrice: number;
}


export default function ReserveButton({
  itemId,
  itemTitle,
  isDefective,
  userSwaps,
  itemPrice,
}: ReserveButtonProps) {

  const [loading, setLoading] = useState(false);
  const [isHybridMode, setIsHybridMode] = useState(false);
  const [swapsBalance, setSwapsBalance] = useState(0);
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    metadata?: { amount?: number; currentAmount?: number; exchangeId?: string };
  }>({
    isOpen: false,
    type: "unexpected_error",
  });
  const router = useRouter();


  const locale = useLocale();
  const t = useTranslations("exchange.reserve");

  const getErrorMessage = (
    code: string,
    data?: {
      retryAfterSeconds?: number;
    } | {
      exchangeId?: string;
    }
  ) => {
    switch (code) {
      case "auth_required":
        return t("errors.authRequired");
      case "rate_limited":
        return t("errors.rateLimited", { seconds: (data as any)?.retryAfterSeconds ?? 0 });
      case "item_not_found":
        return t("errors.itemNotFound");
      case "item_unavailable":
        return t("errors.itemUnavailable");
      case "own_item_forbidden":
        return t("errors.ownItem");
      case "insufficient_swaps":
        return t("errors.insufficientSwaps");
      default:
        return t("errors.generic");
    }
  };

  const handleReserve = async () => {
    setLoading(true);

    try {
      const result = await reserveItem(itemId, swapsBalance);
      if (!result.ok) {
        if (result.code === "insufficient_swaps") {
          setFeedback({
            isOpen: true,
            type: "insufficient_swaps",
            metadata: {
              amount: (result.data as any)?.requiredAmount ?? itemPrice + swapsBalance,
              currentAmount: (result.data as any)?.currentAmount ?? userSwaps
            }
          });
        } else if (result.code === "auth_required") {
          setFeedback({ isOpen: true, type: "auth_required" });
        } else if (result.code === "own_item_forbidden") {
          setFeedback({ isOpen: true, type: "own_item_forbidden" });
        } else {
          setFeedback({ isOpen: true, type: "unexpected_error" });
        }
        return;
      }

      setFeedback({
        isOpen: true,
        type: "exchange_reserved",
        metadata: { exchangeId: result.data?.exchangeId }
      });
    } catch {
      setFeedback({ isOpen: true, type: "unexpected_error" });
    } finally {

      setLoading(false);
    }
  };

  const adjustSwaps = (amount: number) => {
    const newVal = swapsBalance + amount;
    if (newVal < 0 && Math.abs(newVal) > 1000) return;
    setSwapsBalance(newVal);
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="mb-2 flex flex-col gap-3 rounded-3xl border border-border bg-surface/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-muted">
              {t("hybridTitle")}
            </span>
          </div>
          <button
            onClick={() => setIsHybridMode(!isHybridMode)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
              isHybridMode ? "bg-primary text-white" : "bg-muted/20 text-muted"
            )}
          >
            {isHybridMode ? t("disableHybrid") : t("adjustHybrid")}
          </button>
        </div>


        {isHybridMode && (
          <div className="animate-in slide-in-from-top-2 pt-2 duration-300 fade-in">
            <p className="mb-3 text-center text-[10px] font-bold italic text-muted">
              {t("hybridBody")}
            </p>
            <div className="mb-4 flex items-center justify-center gap-6">
              <button
                onClick={() => adjustSwaps(-50)}
                className="text-muted transition-colors hover:text-primary"
              >
                <MinusCircle className="h-8 w-8" />
              </button>
              <div className="min-w-[80px] text-center">
                <span
                  className={cn(
                    "text-2xl font-black tabular-nums",
                    swapsBalance === 0 ? "text-muted/30" : "text-primary"
                  )}
                >
                  {swapsBalance > 0 ? "+" : ""}
                  {swapsBalance}
                </span>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted">
                  {t("swapsLabel")}
                </p>
              </div>
              <button
                onClick={() => adjustSwaps(50)}
                className="text-muted transition-colors hover:text-primary"
              >
                <PlusCircle className="h-8 w-8" />
              </button>
            </div>

            {swapsBalance > 0 && (
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-center text-[10px] font-bold text-primary">
                {t("hybridExtra", { amount: swapsBalance })}
              </div>
            )}

          </div>
        )}
      </div>

      <button
        onClick={handleReserve}
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-center gap-3 rounded-[20px] py-5 text-[14px] font-black uppercase tracking-widest text-white shadow-cta transition-all active:scale-[0.98]",
          loading ? "cursor-not-allowed opacity-70" : "",
          isDefective
            ? "bg-warning shadow-warning/30 hover:bg-warning/90"
            : "bg-foreground shadow-card hover:bg-foreground/90"
        )}

      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isDefective ? (
          t("acceptAndReserve")
        ) : (
          t("reserveThisItem")
        )}
      </button>

      <FeedbackSheet 
        isOpen={feedback.isOpen}
        onClose={() => {
          setFeedback(prev => ({ ...prev, isOpen: false }));
          if (feedback.type === "exchange_reserved" && feedback.metadata?.exchangeId) {
            router.push(localizeHref(locale, `/exchange/${feedback.metadata.exchangeId}`));
          }
        }}
        type={feedback.type}
        metadata={feedback.metadata}
      />
    </div>


  );
}
