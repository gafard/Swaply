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
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <label htmlFor="creditValue" className="text-sm font-bold text-gray-800">
          {t("pricing.title")}
        </label>
        <div
          className={cn(
            "rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-widest",
            isOutOfRange ? "animate-pulse bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
          )}
        >
          {isOutOfRange ? t("pricing.outlier") : t("pricing.coherent")}
        </div>
      </div>

      <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl font-black text-slate-900">{creditValue}</span>
            <span className="ml-2 text-sm font-black uppercase text-indigo-600">
              {t("pricing.credits")}
            </span>
          </div>
        </div>

        <div className="px-2">
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
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-indigo-600"
          />
          <div className="mt-2 flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-300">
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
            className="flex items-start gap-2 rounded-2xl border border-amber-100 bg-amber-50 p-3"
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
