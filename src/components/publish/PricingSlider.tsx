"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AIEstimation } from "@/lib/validations";
import { cn } from "@/lib/utils";

type PricingSliderProps = {
  creditValue: number;
  errorMessage?: string | null;
  estimation?: AIEstimation;
  isOutOfRange: boolean;
  onChange: (value: number) => void;
};

export default function PricingSlider({
  creditValue,
  errorMessage,
  estimation,
  isOutOfRange,
  onChange,
}: PricingSliderProps) {
  const t = useTranslations("publish");
  const errorId = "creditValue-error";
  const outlierId = "creditValue-outlier";

  return (
    <div className="space-y-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <label htmlFor="creditValue" className="text-sm font-bold text-gray-800">
          {t("pricing.title")}
        </label>
        <div
          className={cn(
            "rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm",
            isOutOfRange ? "animate-pulse bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
          )}
        >
          {isOutOfRange ? t("pricing.outlier") : t("pricing.coherent")}
        </div>
      </div>

      <div className="relative space-y-6 overflow-hidden rounded-[34px] border border-slate-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f5f2ff_100%)] p-6 shadow-[0_18px_48px_rgba(16,32,58,0.08)]">
        <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="pointer-events-none absolute left-6 top-8 h-16 w-16 rounded-full bg-amber-200/25 blur-2xl" />

        <div className="flex items-center justify-center">
          <div className="rounded-[30px] border border-white/90 bg-white/90 px-8 py-6 text-center shadow-[0_18px_42px_rgba(36,87,255,0.10)]">
            <span className="text-5xl font-black tracking-[-0.05em] text-slate-900">{creditValue}</span>
            <span className="ml-2 text-sm font-black uppercase tracking-[0.18em] text-indigo-600">
              {t("pricing.credits")}
            </span>
          </div>
        </div>

        {estimation ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-slate-100 bg-white/85 p-4 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                {t("pricing.recommendedEstimation")}
              </p>
              <p className="mt-2 text-lg font-black text-slate-900">
                {estimation.suggestedValue} {t("pricing.creditsShort")}
              </p>
            </div>
            <div className="rounded-[22px] border border-slate-100 bg-white/85 p-4 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                {t("pricing.range")}
              </p>
              <p className="mt-2 text-lg font-black text-slate-900">
                {estimation.minSuggestedValue} - {estimation.maxSuggestedValue} {t("pricing.creditsShort")}
              </p>
            </div>
          </div>
        ) : null}

        <div className="rounded-[28px] border border-slate-100 bg-white/80 px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <input
            id="creditValue"
            type="range"
            name="creditValue"
            min="10"
            max="1000"
            step="5"
            value={creditValue}
            aria-label={t("pricing.title")}
            aria-valuemin={10}
            aria-valuemax={1000}
            aria-valuenow={creditValue}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={cn(
              errorMessage ? errorId : "",
              isOutOfRange && estimation ? outlierId : ""
            ).trim() || undefined}
            onChange={(event) => onChange(parseInt(event.target.value, 10))}
            className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-indigo-600"
          />
          <div className="mt-3 flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-300">
            <span>{t("pricing.accessible")}</span>
            <span>{t("pricing.premium")}</span>
          </div>
        </div>

        {errorMessage ? (
          <p id={errorId} role="alert" className="text-[10px] font-bold text-rose-600">
            {errorMessage}
          </p>
        ) : null}

        {isOutOfRange && estimation ? (
          <div
            id={outlierId}
            className="flex items-start gap-2 rounded-[24px] border border-amber-100 bg-amber-50 p-4 shadow-sm"
          >
            <Info className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
            <p className="text-[10px] font-bold leading-tight text-amber-700">
              {t("pricing.outlierHelp", {
                min: estimation.minSuggestedValue,
                max: estimation.maxSuggestedValue,
                credits: t("pricing.creditsShort"),
              })}{" "}
              <br />
              <span className="opacity-70">{t("pricing.outlierHint")}</span>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
