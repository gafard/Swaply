"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

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
  const normalizedValue = Number.isFinite(creditValue) ? creditValue : 0;
  const sliderValue = Math.min(1000, Math.max(10, normalizedValue || 10));
  const inputValue = useMemo(
    () => (Number.isFinite(creditValue) && creditValue > 0 ? String(creditValue) : ""),
    [creditValue]
  );

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label htmlFor="creditValue" className="text-sm font-semibold text-slate-900">
            {t("pricing.title")}
          </label>
          {estimation ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {t("pricing.recommendedEstimation")}: {estimation.suggestedValue}{" "}
              {t("pricing.creditsShort")} · {t("pricing.range")}: {estimation.minSuggestedValue}-
              {estimation.maxSuggestedValue} {t("pricing.creditsShort")}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-medium text-nowrap",
            isOutOfRange
              ? "border border-amber-200 bg-amber-50 text-amber-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
          )}
        >
          {isOutOfRange ? t("pricing.outlier") : t("pricing.coherent")}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="relative">
          <input
            id="creditValue"
            type="number"
            name="creditValue"
            min="10"
            max="1000"
            step="5"
            inputMode="numeric"
            value={inputValue}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={cn(
              errorMessage ? errorId : "",
              isOutOfRange && estimation ? outlierId : ""
            ).trim() || undefined}
            onChange={(event) => {
              const nextValue = parseInt(event.target.value, 10);
              onChange(Number.isNaN(nextValue) ? 0 : nextValue);
            }}
            className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 pr-20 text-2xl font-semibold tracking-[-0.03em] text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {t("pricing.creditsShort")}
          </span>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
          <input
            type="range"
            min="10"
            max="1000"
            step="5"
            value={sliderValue}
            aria-label={t("pricing.title")}
            aria-valuemin={10}
            aria-valuemax={1000}
            aria-valuenow={sliderValue}
            onChange={(event) => onChange(parseInt(event.target.value, 10))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-slate-900"
          />
          <div className="mt-3 flex justify-between text-[11px] font-medium text-slate-400">
            <span>10 {t("pricing.creditsShort")}</span>
            <span>1000 {t("pricing.creditsShort")}</span>
          </div>
        </div>

        {errorMessage ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-rose-600">
            {errorMessage}
          </p>
        ) : null}

        {isOutOfRange && estimation ? (
          <div
            id={outlierId}
            className="flex items-start gap-2 rounded-[18px] border border-amber-200 bg-amber-50 px-3 py-3"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-xs leading-5 text-amber-800">
              {t("pricing.outlierHelp", {
                min: estimation.minSuggestedValue,
                max: estimation.maxSuggestedValue,
                credits: t("pricing.creditsShort"),
              })}{" "}
              <span className="text-amber-700">{t("pricing.outlierHint")}</span>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
