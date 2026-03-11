"use client";

import type { ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  RefreshCw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { PhotoQualityResult } from "@/lib/validations";

export interface PublishScanStep {
  label: string;
  desc: string;
  guide: string;
  icon: LucideIcon;
}

type PhotoScannerProps = {
  currentStep: number;
  errorMessage?: string | null;
  isCheckingQuality: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onStepChange: (step: number) => void;
  photoPreviews: string[];
  qualityResults: (PhotoQualityResult | null)[];
  scanSteps: PublishScanStep[];
};

export default function PhotoScanner({
  currentStep,
  errorMessage,
  isCheckingQuality,
  onFileChange,
  onReset,
  onStepChange,
  photoPreviews,
  qualityResults,
  scanSteps,
}: PhotoScannerProps) {
  const t = useTranslations("publish");
  const currentQuality = qualityResults[currentStep];
  const currentPreview = photoPreviews[currentStep];

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/80 bg-[#fffaf2]/90 p-5 shadow-[0_18px_50px_rgba(16,32,58,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
              {t("scanner.title")}
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-display text-[1.75rem] font-bold tracking-[-0.05em] text-foreground">
                {t("scanner.stepCounter", {
                  current: currentStep + 1,
                  total: scanSteps.length,
                })}
              </span>
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                {t("scanner.aiAssisted")}
              </span>
            </div>
          </div>

          {isCheckingQuality && (
            <div className="animate-pulse rounded-full border border-primary/10 bg-[#edf3ff] px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                  {t("scanner.vision")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
            {scanSteps[currentStep].label}
          </label>
          <p className="mt-1 max-w-[220px] text-sm font-medium leading-5 text-slate-500">
            {scanSteps[currentStep].desc}
          </p>
        </div>

        <div className="rounded-full border border-slate-200 bg-white/70 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 shadow-sm">
          {t("scanner.aiAssisted")}
        </div>
      </div>

      <div className="relative h-[450px] w-full aspect-[4/5]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "group absolute inset-0 overflow-hidden rounded-[36px] border shadow-[0_24px_70px_rgba(16,32,58,0.18)] transition-all duration-700",
              isCheckingQuality
                ? "border-primary/35 shadow-[0_24px_70px_rgba(36,87,255,0.16)]"
                : "border-white/30"
            )}
          >
            {currentQuality && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute inset-x-6 top-6 z-30"
              >
                <div
                  className={cn(
                    "flex items-center justify-between rounded-3xl border p-4 text-white shadow-popup backdrop-blur-2xl",
                    currentQuality.qualityScore > 0.7
                      ? "border-emerald-500/30 bg-emerald-500/20"
                      : "border-amber-500/30 bg-amber-500/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-2xl shadow-inner",
                        currentQuality.qualityScore > 0.7 ? "bg-emerald-500" : "bg-amber-500"
                      )}
                    >
                      {currentQuality.qualityScore > 0.7 ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider leading-none">
                        {currentQuality.qualityScore > 0.7
                          ? t("scanner.quality.excellent")
                          : t("scanner.quality.warning")}
                      </p>
                      <p className="mt-1.5 text-[10px] font-medium leading-none opacity-80">
                        {currentQuality.suggestions[0] || t("scanner.quality.ready")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentPreview ? (
              <div className="group relative h-full w-full">
                <img
                  src={currentPreview}
                  alt={t("scanner.previewAlt")}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                  <div className="relative">
                    <button className="flex items-center gap-2 rounded-[2rem] bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-900 shadow-2xl transition-all active:scale-95">
                      <RefreshCw className="h-5 w-5 text-indigo-600" />
                      {t("scanner.retakePhoto")}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label={t("scanner.retakePhoto")}
                      onChange={onFileChange}
                    />
                  </div>

                  {currentStep < scanSteps.length - 1 && (
                    <button
                      type="button"
                      onClick={() => onStepChange(currentStep + 1)}
                      className="flex items-center gap-2 rounded-[2rem] bg-indigo-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition-all active:scale-95"
                    >
                      {t("scanner.nextStep")}
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative flex h-full w-full flex-col items-center justify-center bg-[#081535] p-8 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(36,87,255,0.38),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(255,142,99,0.14),_transparent_30%)]" />

                <div className="pointer-events-none absolute inset-8 rounded-[32px] border border-white/8">
                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/6" />
                  <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/6" />
                  <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-3xl border-l-2 border-t-2 border-primary/40" />
                  <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-3xl border-r-2 border-t-2 border-primary/40" />
                  <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-3xl border-b-2 border-l-2 border-primary/40" />
                  <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-3xl border-b-2 border-r-2 border-primary/40" />
                </div>

                <div className="relative z-10 space-y-6">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/8 shadow-2xl shadow-blue-500/10 backdrop-blur-xl"
                  >
                    {(() => {
                      const Icon = scanSteps[currentStep].icon;
                      return <Icon className="h-10 w-10 text-white" />;
                    })()}
                  </motion.div>
                  <div className="px-4">
                    <h3 className="font-display mb-2 text-[2rem] font-bold tracking-[-0.05em] text-white">
                      {scanSteps[currentStep].label}
                    </h3>
                    <p className="text-sm font-medium leading-relaxed text-white/50">
                      {scanSteps[currentStep].desc}
                    </p>
                  </div>
                </div>

                <div className="absolute inset-x-6 bottom-6">
                  <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/6 p-4 shadow-popup backdrop-blur-2xl">
                    <p className="mx-auto flex max-w-[240px] items-center justify-center gap-2 text-center text-[9px] font-bold uppercase leading-4 tracking-[0.16em] text-[#7ca3ff]">
                      <Sparkles className="h-3.5 w-3.5" />
                      {scanSteps[currentStep].guide}
                    </p>
                    <div className="relative">
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-[#fffaf2] py-4 text-sm font-black uppercase tracking-[0.2em] text-foreground shadow-[0_14px_40px_rgba(16,32,58,0.22)] transition-all active:scale-95"
                      >
                        <Camera className="h-5 w-5 text-primary" />
                        {t("scanner.scanObject")}
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="absolute inset-0 cursor-pointer opacity-0"
                        aria-label={t("scanner.scanObject")}
                        onChange={onFileChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="no-scrollbar flex items-center gap-3 overflow-x-auto px-1 py-2">
        {scanSteps.map((step, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onStepChange(idx)}
            disabled={!photoPreviews[idx] && idx !== currentStep}
            aria-pressed={currentStep === idx}
            className={cn(
              "relative flex aspect-square w-20 flex-shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-3xl border-2 transition-all duration-500",
              currentStep === idx
                ? "border-indigo-500 bg-white ring-4 ring-indigo-50 shadow-lg"
                : "border-transparent bg-white/50",
              !photoPreviews[idx] && idx !== currentStep && "cursor-not-allowed opacity-60"
            )}
          >
            {photoPreviews[idx] ? (
              <>
                <img src={photoPreviews[idx]} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-lg">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
              </>
            ) : (
              <>
                <step.icon
                  className={cn(
                    "h-5 w-5",
                    currentStep === idx ? "text-indigo-600" : "text-slate-300"
                  )}
                />
                <span
                  className={cn(
                    "text-[8px] font-black uppercase tracking-tighter",
                    currentStep === idx ? "text-indigo-900" : "text-slate-400"
                  )}
                >
                  {t("scanner.stepBadge", { index: idx + 1 })}
                </span>
              </>
            )}
          </button>
        ))}

        {photoPreviews.some(Boolean) && (
          <button
            type="button"
            onClick={onReset}
            aria-label={t("scanner.resetAll")}
            title={t("scanner.resetAll")}
            className="flex aspect-square w-20 flex-shrink-0 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-rose-200 hover:text-rose-500"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        )}
      </div>

      {errorMessage ? (
        <div
          role="alert"
          aria-live="polite"
          className="mx-1 flex items-start gap-3 rounded-3xl border border-rose-100 bg-rose-50 p-4"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
          <p className="text-[11px] font-bold leading-tight text-rose-800">{errorMessage}</p>
        </div>
      ) : null}
    </div>
  );
}
