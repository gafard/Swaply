"use client";

import { type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  FolderOpen,
  RefreshCw,
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
  currentUploadProgress: number;
  currentUploadStatus: "idle" | "processing" | "uploading" | "uploaded" | "failed";
  errorMessage?: string | null;
  isCheckingQuality: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onStepChange: (step: number) => void;
  photoPreviews: string[];
  uploadProgressByStep: number[];
  uploadStatuses: ("idle" | "processing" | "uploading" | "uploaded" | "failed")[];
  qualityResults: (PhotoQualityResult | null)[];
  scanSteps: PublishScanStep[];
};

export default function PhotoScanner({
  currentStep,
  currentUploadProgress,
  currentUploadStatus,
  errorMessage,
  isCheckingQuality,
  onFileChange,
  onReset,
  onStepChange,
  photoPreviews,
  uploadProgressByStep,
  uploadStatuses,
  qualityResults,
  scanSteps,
}: PhotoScannerProps) {
  const t = useTranslations("publish");
  const currentQuality = qualityResults[currentStep];
  const currentPreview = photoPreviews[currentStep];
  const isCurrentPhotoBusy =
    currentUploadStatus === "processing" || currentUploadStatus === "uploading";
  const currentStatusLabel =
    currentUploadStatus === "processing"
      ? t("scanner.loading.preparing")
      : currentUploadStatus === "uploading"
        ? t("scanner.loading.uploading")
        : null;

  return (
    <div className="space-y-4">
      <div className="px-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              {t("scanner.stepCounter", {
                current: currentStep + 1,
                total: scanSteps.length,
              })}
            </p>
            <h3 className="mt-2 font-display text-[1.6rem] font-bold tracking-[-0.05em] text-slate-950">
              {scanSteps[currentStep].label}
            </h3>
            <p className="mt-1 max-w-[20rem] text-sm font-medium leading-5 text-slate-500">
              {scanSteps[currentStep].desc}
            </p>
          </div>

          {isCheckingQuality ? (
            <div className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  {t("scanner.vision")}
                </span>
              </div>
            </div>
          ) : null}
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
              "absolute inset-0 overflow-hidden rounded-[32px] border bg-white shadow-[0_18px_48px_rgba(16,32,58,0.12)] transition-all duration-500",
              isCheckingQuality
                ? "border-primary/35 shadow-[0_20px_55px_rgba(36,87,255,0.12)]"
                : "border-slate-200/70"
            )}
          >
            {currentQuality && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute inset-x-4 top-4 z-30"
              >
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-full border px-4 py-3 text-white shadow-popup backdrop-blur-2xl",
                    currentQuality.qualityScore > 0.7
                      ? "border-emerald-500/30 bg-emerald-500/20"
                      : "border-amber-500/30 bg-amber-500/20"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      currentQuality.qualityScore > 0.7 ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  >
                    {currentQuality.qualityScore > 0.7 ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] leading-none">
                      {currentQuality.qualityScore > 0.7
                        ? t("scanner.quality.excellent")
                        : t("scanner.quality.warning")}
                    </p>
                    <p className="mt-1 text-[11px] font-medium leading-none opacity-85">
                      {currentQuality.suggestions[0] || t("scanner.quality.ready")}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {currentPreview ? (
              <div className="relative h-full w-full">
                <img
                  src={currentPreview}
                  alt={t("scanner.previewAlt")}
                  className="h-full w-full object-cover"
                />
                {isCurrentPhotoBusy ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/38 backdrop-blur-[2px]">
                    <div className="w-[78%] max-w-[19rem] rounded-[24px] border border-white/15 bg-slate-950/72 p-4 text-white shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                          <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/80">
                            {currentStatusLabel}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {currentUploadStatus === "processing"
                              ? t("scanner.loading.processingHint")
                              : t("scanner.loading.uploadingHint")}
                          </p>
                        </div>
                        {currentUploadStatus === "uploading" ? (
                          <span className="text-sm font-black tabular-nums text-white">
                            {Math.round(currentUploadProgress)}%
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300 transition-[width] duration-200"
                          style={{
                            width: `${
                              currentUploadStatus === "processing"
                                ? 18
                                : Math.max(currentUploadProgress, 8)
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/28 to-transparent px-4 pb-4 pt-16">
                  <div className="space-y-3 rounded-[24px] border border-white/15 bg-slate-950/48 p-3 shadow-2xl backdrop-blur-xl">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-[18px] bg-white px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-slate-900 shadow-lg">
                        <Camera className="h-4 w-4 text-primary" />
                        {t("scanner.sourcePicker.camera")}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="sr-only"
                          onChange={onFileChange}
                        />
                      </label>
                      <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-[18px] border border-white/15 bg-white/10 px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-white">
                        <FolderOpen className="h-4 w-4" />
                        {t("scanner.sourcePicker.library")}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={onFileChange}
                        />
                      </label>
                    </div>
                    {currentStep < scanSteps.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => onStepChange(currentStep + 1)}
                        disabled={isCurrentPhotoBusy}
                        className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-indigo-600 to-blue-500 px-5 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-white"
                      >
                        {t("scanner.nextStep")}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative flex h-full w-full flex-col items-center justify-center bg-[linear-gradient(180deg,#0f172a_0%,#10203a_100%)] p-8 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(36,87,255,0.2),_transparent_34%)]" />

                <div className="relative z-10 space-y-5">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[24px] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl"
                  >
                    {(() => {
                      const Icon = scanSteps[currentStep].icon;
                      return <Icon className="h-9 w-9 text-white" />;
                    })()}
                  </motion.div>
                  <div className="px-2">
                    <h3 className="font-display mb-2 text-[1.9rem] font-bold tracking-[-0.05em] text-white">
                      {scanSteps[currentStep].label}
                    </h3>
                    <p className="text-sm font-medium leading-relaxed text-white/60">
                      {scanSteps[currentStep].guide}
                    </p>
                  </div>
                </div>

                <div className="absolute inset-x-5 bottom-5">
                  <div className="space-y-2 rounded-[24px] border border-white/10 bg-white/8 p-3 shadow-popup backdrop-blur-2xl">
                    <label className="relative flex cursor-pointer items-center justify-center gap-3 rounded-[18px] bg-[#fffaf2] py-4 text-sm font-black uppercase tracking-[0.16em] text-foreground shadow-[0_14px_40px_rgba(16,32,58,0.22)]">
                      <Camera className="h-5 w-5 text-primary" />
                      {t("scanner.sourcePicker.camera")}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        onChange={onFileChange}
                      />
                    </label>
                    <label className="relative flex cursor-pointer items-center justify-center gap-3 rounded-[18px] border border-white/15 bg-white/8 py-4 text-sm font-black uppercase tracking-[0.16em] text-white">
                      <FolderOpen className="h-5 w-5" />
                      {t("scanner.sourcePicker.library")}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={onFileChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-1 py-1">
        {scanSteps.map((step, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onStepChange(idx)}
            disabled={!photoPreviews[idx] && idx !== currentStep}
            aria-pressed={currentStep === idx}
              className={cn(
                "relative flex aspect-square w-[4.5rem] flex-shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-[22px] border shadow-[0_8px_20px_rgba(16,32,58,0.05)] transition-all duration-300",
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
                {uploadStatuses[idx] === "processing" || uploadStatuses[idx] === "uploading" ? (
                  <div className="absolute inset-x-2 bottom-2 z-10 overflow-hidden rounded-full bg-black/45">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300 transition-[width] duration-200"
                      style={{
                        width: `${
                          uploadStatuses[idx] === "processing"
                            ? 18
                            : Math.max(uploadProgressByStep[idx] ?? 0, 8)
                        }%`,
                      }}
                    />
                  </div>
                ) : null}
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-lg">
                  {uploadStatuses[idx] === "uploaded" ? (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-emerald-500">
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </div>
                  ) : uploadStatuses[idx] === "failed" ? (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-rose-500">
                      <AlertTriangle className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900/60">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                    </div>
                  )}
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
            className="flex aspect-square w-[4.5rem] flex-shrink-0 items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-rose-200 hover:text-rose-500"
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
