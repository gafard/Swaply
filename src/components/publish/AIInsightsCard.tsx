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
    <div className="space-y-5 rounded-3xl border border-slate-200/60 bg-[#F8FAFC] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {t("ai.title")}
          </span>
        </div>
        {isAnalyzing ? (
          <span className="animate-pulse text-[10px] font-bold text-primary">
            {t("ai.extracting")}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            {t("ai.detectedType")}
          </p>
          <p className="text-[12px] font-bold leading-tight text-foreground">
            {aiInsights.subcategory || aiInsights.category || "---"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            {t("ai.brand")}
          </p>
          <p className="truncate text-[12px] font-bold text-foreground">
            {aiInsights.brand && aiInsights.brand !== "unknown"
              ? aiInsights.brand
              : t("ai.genericBrand")}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            {t("ai.visualState")}
          </p>
          <p className="text-[12px] font-bold capitalize text-foreground">
            {aiInsights.condition || "---"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            {t("ai.rarity")}
          </p>
          <p className="text-[12px] font-bold capitalize text-primary">
            {aiInsights.rarity || "---"}
          </p>
        </div>
      </div>

      {isElectronics ? (
        <div className="space-y-5 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50">
              <Laptop className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">
              {t("technical.title")}
            </span>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="modelGuess"
              className="pl-1 text-[10px] font-black uppercase tracking-wider text-slate-400"
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-bold text-slate-800 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500"
                placeholder={t("technical.modelPlaceholder")}
              />
              <Wand2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400 opacity-50" />
            </div>
            <p className="flex items-center gap-1 pl-1 text-[9px] italic text-slate-400">
              <Info className="h-2.5 w-2.5" />
              {t("technical.modelHint")}
            </p>
          </div>

          <div className="space-y-2">
            <label className="pl-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              {t("technical.ageLabel")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ageOptions.map((age) => (
                <button
                  key={age.id}
                  type="button"
                  onClick={() => onAgeChange(age.id)}
                  className={cn(
                    "rounded-xl border py-2.5 text-[10px] font-black transition-all",
                    techAge === age.id
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                  )}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="pl-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
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
                      "flex items-center gap-1.5 rounded-full border px-3 py-2 text-[9px] font-black transition-all",
                      isSelected
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-100 bg-white text-slate-400"
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
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-3xl border border-indigo-100/50 bg-indigo-50/50 p-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                {t("pricing.recommendedEstimation")}
              </span>
              <span className="text-2xl font-black text-slate-900">
                {aiInsights.estimation.suggestedValue}{" "}
                <span className="text-sm font-black opacity-50">
                  {t("pricing.creditsShort")}
                </span>
              </span>
            </div>

            <div className="text-right">
              <span className="block text-[9px] font-bold uppercase text-slate-400">
                {t("pricing.range")}
              </span>
              <span className="text-[12px] font-black text-indigo-600">
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
            "flex items-start gap-3 rounded-2xl border p-3",
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
                "text-[11px] font-bold",
                aiInsights.fraudRisk === "high" ? "text-rose-700" : "text-amber-700"
              )}
            >
              {aiInsights.fraudRisk === "high"
                ? t("ai.qualityInsufficient")
                : t("ai.listingUnderWatch")}
            </p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
              {aiInsights.flags?.join(", ") || t("ai.qualityCriteriaNotMet")}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
