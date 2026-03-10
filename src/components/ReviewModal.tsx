"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, Star, X } from "lucide-react";
import { toast } from "react-hot-toast";

import { submitReview } from "@/app/actions/exchange";

interface ReviewModalProps {
  exchangeId: string;
  onClose: () => void;
}

export default function ReviewModal({ exchangeId, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const t = useTranslations("exchange.review");

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "auth_required":
        return t("errors.authRequired");
      case "rating_invalid":
        return t("errors.ratingInvalid");
      case "exchange_not_found":
        return t("errors.exchangeNotFound");
      case "exchange_not_completed":
        return t("errors.exchangeNotCompleted");
      case "review_already_exists":
        return t("errors.reviewAlreadyExists");
      default:
        return t("errors.generic");
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t("errors.ratingMissing"));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitReview({ exchangeId, rating, comment });

      if (!result.ok) {
        toast.error(getErrorMessage(result.code));
        return;
      }

      setIsSuccess(true);
      toast.success(t("success"));
      setTimeout(onClose, 2000);
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        <div className="relative flex h-24 items-center justify-center bg-indigo-600">
          <div
            className="absolute right-4 top-4 cursor-pointer text-white/50 hover:text-white"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </div>
          <div className="translate-y-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-xl">
            <Star className="h-8 w-8 fill-indigo-600" />
          </div>
        </div>

        <div className="flex flex-col items-center px-8 pb-8 pt-12 text-center">
          {isSuccess ? (
            <div className="animate-in zoom-in space-y-4 py-8 duration-500">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">{t("successTitle")}</h3>
              <p className="text-sm text-slate-400">{t("successBody")}</p>
            </div>
          ) : (
            <>
              <h3 className="mb-1 text-xl font-black text-slate-900">{t("title")}</h3>
              <p className="mb-8 text-sm text-slate-400">{t("body")}</p>

              <div className="mb-8 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star
                      className={`h-10 w-10 transition-colors ${
                        star <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("placeholder")}
                className="mb-8 h-24 w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm outline-none transition-colors focus:border-indigo-500"
              />

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 font-black text-white shadow-xl shadow-indigo-100 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t("submit")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
