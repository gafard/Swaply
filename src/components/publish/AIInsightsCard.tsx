"use client";

import { Check, Info, Laptop, Sparkles, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";

import JustificationCard from "@/components/JustificationCard";
import { cn } from "@/lib/utils";
import type { AIEstimation } from "@/lib/validations";

export type PublishAIInsights = {
  category?: string;
  subcategory?: string;
  brand?: string;
  condition?: string;
  visualStatus?: "PERFECT" | "DEFECTIVE" | "BROKEN";
  rarity?: string;
  fraudRisk?: string;
  isStockPhoto?: boolean;
  flags?: string[];
  confidence?: number;
  estimation?: AIEstimation;
};

type PublishOption = {
  id: string;
  label: string;
};

type AIInsightsCardProps = {
  accessoryOptions: PublishOption[];
  ageOptions: PublishOption[];
  aiInsights: PublishAIInsights;
  isAnalyzing: boolean;
  isElectronics: boolean;
  modelGuess: string;
  onAccessoryToggle: (accessoryId: string) => void;
  onAgeChange: (ageId: string) => void;
  onModelGuessChange: (value: string) => void;
  techAccessories: string[];
  techAge: string;
};

export default function AIInsightsCard({
  accessoryOptions,
  ageOptions,
  aiInsights,
  isAnalyzing,
  isElectronics,
  modelGuess,
  onAccessoryToggle,
  onAgeChange,
  onModelGuessChange,
  techAccessories,
  techAge,
}: AIInsightsCardProps) {
  const t = useTranslations("publish");

  if (!aiInsights.category && !isAnalyzing) {
    return null;
  }

  return (
    <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            {t("ai.title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {aiInsights.confidence ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              {Math.round(aiInsights.confidence * 100)}%
            </span>
          ) : null}
          {isAnalyzing ? (
            <span className="animate-pulse text-[10px] font-medium text-slate-500">
              {t("ai.extracting")}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-3">
          <p className="mb-1 text-[10px] font-medium text-slate-500">
            {t("ai.detectedType")}
          </p>
          <p className="text-sm font-semibold leading-tight text-slate-900">
            {aiInsights.subcategory || aiInsights.category || "---"}
          </p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-3">
          <p className="mb-1 text-[10px] font-medium text-slate-500">
            {t("ai.brand")}
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">
            {aiInsights.brand && aiInsights.brand !== "unknown"
              ? aiInsights.brand
              : t("ai.genericBrand")}
          </p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-3">
          <p className="mb-1 text-[10px] font-medium text-slate-500">
            {t("ai.visualState")}
          </p>
          <p className="text-sm font-semibold capitalize text-slate-900">
            {aiInsights.condition || "---"}
          </p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-3">
          <p className="mb-1 text-[10px] font-medium text-slate-500">
            {t("ai.rarity")}
          </p>
          <p className="text-sm font-semibold capitalize text-slate-900">
            {aiInsights.rarity || "---"}
          </p>
        </div>
      </div>

      {isElectronics ? (
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
              <Laptop className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold text-slate-900">
              {t("technical.title")}
            </span>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="modelGuess"
              className="pl-1 text-sm font-medium text-slate-700"
            >
              {t("technical.model")}
            </label>
            <div className="relative">
              <input
                id="modelGuess"
                type="text"
                name="modelGuess"
                value={modelGuess}
                onChange={(event) => onModelGuessChange(event.target.value)}
                className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-slate-400"
                placeholder={t("technical.modelPlaceholder")}
              />
              <Wand2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
            </div>
            <p className="flex items-center gap-1 pl-1 text-[11px] text-slate-500">
              <Info className="h-2.5 w-2.5" />
              {t("technical.modelHint")}
            </p>
          </div>

          <div className="space-y-2">
            <label className="pl-1 text-sm font-medium text-slate-700">
              {t("technical.ageLabel")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ageOptions.map((age) => (
                <button
                  key={age.id}
                  type="button"
                  onClick={() => onAgeChange(age.id)}
                  className={cn(
                    "rounded-[16px] border py-2.5 text-[11px] font-medium transition-colors",
                    techAge === age.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="pl-1 text-sm font-medium text-slate-700">
              {t("technical.accessoriesLabel")}
            </label>
            <div className="flex flex-wrap gap-2">
              {accessoryOptions.map((accessory) => {
                const isSelected = techAccessories.includes(accessory.id);
                return (
                  <button
                    key={accessory.id}
                    type="button"
                    onClick={() => onAccessoryToggle(accessory.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-medium transition-colors",
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600"
                    )}
                  >
                    {isSelected ? <Check className="h-2.5 w-2.5" /> : null}
                    {accessory.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {aiInsights.estimation && !isAnalyzing ? (
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                {t("pricing.recommendedEstimation")}
              </span>
              <span className="text-2xl font-semibold text-slate-900">
                {aiInsights.estimation.suggestedValue}{" "}
                <span className="text-sm font-semibold text-slate-400">
                  {t("pricing.creditsShort")}
                </span>
              </span>
            </div>

            <div className="text-right">
              <span className="block text-[10px] font-medium text-slate-500">
                {t("pricing.range")}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {aiInsights.estimation.minSuggestedValue} –{" "}
                {aiInsights.estimation.maxSuggestedValue} {t("pricing.creditsShort")}
              </span>
            </div>
          </div>

          <JustificationCard estimation={aiInsights.estimation} />
        </div>
      ) : null}

      {aiInsights.fraudRisk && aiInsights.fraudRisk !== "low" ? (
        <div
          className={cn(
            "flex items-start gap-3 rounded-[22px] border p-4",
            aiInsights.fraudRisk === "high"
              ? "border-rose-100 bg-rose-50"
              : "border-amber-100 bg-amber-50"
          )}
        >
          <Info
            className={cn(
              "mt-0.5 h-4 w-4",
              aiInsights.fraudRisk === "high" ? "text-rose-500" : "text-amber-500"
            )}
          />
          <div>
            <p
              className={cn(
                "text-xs font-semibold",
                aiInsights.fraudRisk === "high" ? "text-rose-700" : "text-amber-700"
              )}
            >
              {aiInsights.fraudRisk === "high"
                ? t("ai.qualityInsufficient")
                : t("ai.listingUnderWatch")}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {aiInsights.flags?.join(", ") || t("ai.qualityCriteriaNotMet")}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
