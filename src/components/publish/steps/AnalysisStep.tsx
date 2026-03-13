"use client";

import React from "react";
import { Check, ShieldCheck, Camera, AlertTriangle } from "lucide-react";
import type { PublishAIInsights } from "@/components/publish/AIInsightsCard";
import AIInsightsCard from "@/components/publish/AIInsightsCard";
import { cn } from "@/lib/utils";

interface ConditionOption {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  techId: string;
}

interface AgeOption {
  id: string;
  label: string;
}

interface AccessoryOption {
  id: string;
  label: string;
}

interface AnalysisStepProps {
  photoPreviews: string[];
  conditionOptions: ConditionOption[];
  functionalStatus: string;
  onFunctionalStatusChange: (id: string, techId: string) => void;
  isConditionInconsistent: boolean;
  aiInsights: PublishAIInsights;
  isAnalyzing: boolean;
  isElectronics: boolean;
  modelGuess: string;
  onModelGuessChange: (value: string) => void;
  techAge: string;
  techAccessories: string[];
  ageOptions: AgeOption[];
  accessoryOptions: AccessoryOption[];
  onAgeChange: (ageId: string) => void;
  onAccessoryToggle: (accessoryId: string) => void;
  // i18n labels
  conditionTitle: string;
  conditionSubtitle: string;
  consistencyAlertTitle: string;
  consistencyAlertBody: React.ReactNode;
  catalogPhotoTitle: string;
  catalogPhotoBody: React.ReactNode;
  aiFallbackTitle: string;
  aiFallbackBody: string;
}

export default function AnalysisStep({
  photoPreviews,
  conditionOptions,
  functionalStatus,
  onFunctionalStatusChange,
  isConditionInconsistent,
  aiInsights,
  isAnalyzing,
  isElectronics,
  modelGuess,
  onModelGuessChange,
  techAge,
  techAccessories,
  ageOptions,
  accessoryOptions,
  onAgeChange,
  onAccessoryToggle,
  conditionTitle,
  conditionSubtitle,
  consistencyAlertTitle,
  consistencyAlertBody,
  catalogPhotoTitle,
  catalogPhotoBody,
  aiFallbackTitle,
  aiFallbackBody,
}: AnalysisStepProps) {
  return (
    <div className="space-y-6">
      {photoPreviews.length > 0 ? (
        <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900">
                {conditionTitle}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {conditionSubtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {conditionOptions.map((status) => (
              <button
                key={status.id}
                type="button"
                onClick={() => onFunctionalStatusChange(status.id, status.techId)}
                className={cn(
                  "group flex items-start gap-4 rounded-[22px] border px-4 py-4 text-left transition-colors duration-200",
                  functionalStatus === status.id
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-200",
                    functionalStatus === status.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  )}
                >
                  <status.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={cn(
                      "text-sm font-semibold tracking-tight transition-colors",
                      functionalStatus === status.id ? "text-slate-950" : "text-slate-800"
                    )}
                  >
                    {status.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {status.desc}
                  </p>
                </div>
                <div
                  className={cn(
                    "mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200",
                    functionalStatus === status.id
                      ? "border-slate-900 bg-slate-900"
                      : "border-slate-300 bg-white group-hover:border-slate-400"
                  )}
                >
                  {functionalStatus === status.id ? (
                    <Check className="h-3 w-3 text-white" strokeWidth={4} />
                  ) : null}
                </div>
              </button>
            ))}
          </div>

          {isConditionInconsistent ? (
            <div className="flex gap-3 rounded-[22px] border border-amber-200 bg-amber-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-white text-amber-600">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <p className="mb-1 text-xs font-semibold text-amber-900">
                  {consistencyAlertTitle}
                </p>
                <p className="text-xs leading-5 text-amber-800">
                  {consistencyAlertBody}
                </p>
              </div>
            </div>
          ) : null}

          {aiInsights.isStockPhoto ? (
            <div className="flex gap-3 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
                <Camera className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <p className="mb-1 text-xs font-semibold text-slate-900">
                  {catalogPhotoTitle}
                </p>
                <p className="text-xs leading-5 text-slate-600">
                  {catalogPhotoBody}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {photoPreviews.length > 0 ? (
        aiInsights.category || isAnalyzing ? (
          <AIInsightsCard
            accessoryOptions={accessoryOptions}
            ageOptions={ageOptions}
            aiInsights={aiInsights}
            isAnalyzing={isAnalyzing}
            isElectronics={isElectronics}
            modelGuess={modelGuess}
            onAccessoryToggle={onAccessoryToggle}
            onAgeChange={onAgeChange}
            onModelGuessChange={onModelGuessChange}
            techAccessories={techAccessories}
            techAge={techAge}
          />
        ) : (
          <div className="rounded-[32px] border border-slate-200/70 bg-[#F8FAFC] p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              {aiFallbackTitle}
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              {aiFallbackBody}
            </p>
          </div>
        )
      ) : null}
    </div>
  );
}
