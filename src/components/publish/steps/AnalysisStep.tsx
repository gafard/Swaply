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
      {photoPreviews.length > 0 && (
        <div className="space-y-5 rounded-[30px] border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                {conditionTitle}
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted">
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
                  "group flex items-start gap-4 rounded-[22px] border px-4 py-3.5 text-left transition-all duration-200",
                  functionalStatus === status.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-surface-raised/40 hover:border-primary/30"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-200",
                    functionalStatus === status.id
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-muted"
                  )}
                >
                  <status.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={cn(
                      "text-sm font-bold transition-colors",
                      functionalStatus === status.id ? "text-primary" : "text-foreground"
                    )}
                  >
                    {status.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {status.desc}
                  </p>
                </div>
                <div
                  className={cn(
                    "mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200",
                    functionalStatus === status.id
                      ? "border-primary bg-primary"
                      : "border-border bg-surface group-hover:border-primary/40"
                  )}
                >
                  {functionalStatus === status.id && (
                    <Check className="h-3 w-3 text-white" strokeWidth={4} />
                  )}
                </div>
              </button>
            ))}
          </div>

          {isConditionInconsistent && (
            <div className="flex gap-3 rounded-[22px] border border-amber-500/25 bg-amber-500/10 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <p className="mb-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  {consistencyAlertTitle}
                </p>
                <p className="text-xs leading-5 text-amber-600/80 dark:text-amber-400/80">
                  {consistencyAlertBody}
                </p>
              </div>
            </div>
          )}

          {aiInsights.isStockPhoto && (
            <div className="flex gap-3 rounded-[22px] border border-border bg-surface-raised p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-surface text-muted">
                <Camera className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <p className="mb-0.5 text-xs font-bold text-foreground">
                  {catalogPhotoTitle}
                </p>
                <p className="text-xs leading-5 text-muted">
                  {catalogPhotoBody}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {photoPreviews.length > 0 && (
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
          <div className="rounded-[30px] border border-border bg-surface-raised/50 p-6 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted">
              {aiFallbackTitle}
            </p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-foreground-muted">
              {aiFallbackBody}
            </p>
          </div>
        )
      )}
    </div>
  );
}
