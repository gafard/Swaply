"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, Flag, Send } from "lucide-react";
import { useTranslations } from "next-intl";

import { reportItem } from "@/app/actions/item";
import { cn } from "@/lib/utils";

const REPORT_REASONS = [
  "misleading_listing",
  "forbidden_item",
  "suspected_scam",
  "offensive_content",
  "other",
] as const;

export default function ReportItemButton({ itemId }: { itemId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>("misleading_listing");
  const [details, setDetails] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("reportItem");

  const helperText = useMemo(() => {
    if (reason === "suspected_scam") {
      return t("helpers.suspectedScam");
    }

    if (reason === "forbidden_item") {
      return t("helpers.forbiddenItem");
    }

    return t("helpers.default");
  }, [reason, t]);

  const getFeedbackMessage = (
    code: string,
    data?: {
      retryAfterSeconds?: number;
    }
  ) => {
    switch (code) {
      case "auth_required":
        return t("errors.authRequired");
      case "rate_limited":
        return t("errors.rateLimited", { seconds: data?.retryAfterSeconds ?? 0 });
      case "report_reason_invalid":
        return t("errors.invalidReason");
      case "item_not_found":
        return t("errors.itemNotFound");
      case "report_own_item":
        return t("errors.ownItem");
      case "report_already_exists":
        return t("errors.alreadyReported");
      case "report_submitted":
        return t("success");
      default:
        return t("errors.generic");
    }
  };

  const handleSubmit = () => {
    setFeedback(null);

    startTransition(async () => {
      const result = await reportItem(itemId, reason, details);
      setFeedback(getFeedbackMessage(result.code, result.data));

      if (result.ok) {
        setDetails("");
        setIsOpen(false);
      }
    });
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-rose-600 transition hover:bg-rose-100"
      >
        <Flag className="w-4 h-4" />
        {t("button")}
      </button>

      {isOpen && (
        <div className="rounded-[28px] border border-rose-100 bg-rose-50/60 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-rose-100 text-rose-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{t("title")}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                {t("description")}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
              {t("reason")}
            </label>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value as (typeof REPORT_REASONS)[number])}
              className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-rose-300"
            >
              {REPORT_REASONS.map((reportReason) => (
                <option key={reportReason} value={reportReason}>
                  {t(`reasons.${reportReason}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
              {t("details")}
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder={helperText}
              className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-300 resize-none"
            />
            <p className="text-[10px] text-slate-400 font-bold mt-2">{helperText}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-2xl border border-white bg-white px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className={cn(
                "flex-1 rounded-2xl bg-rose-500 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2",
                isPending && "opacity-60"
              )}
            >
              <Send className="w-3.5 h-3.5" />
              {isPending ? t("submitting") : t("submit")}
            </button>
          </div>
        </div>
      )}

      {feedback && <p className="text-[11px] font-bold text-slate-500">{feedback}</p>}
    </div>
  );
}
