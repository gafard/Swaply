"use client";

import React from "react";
import type { PublishScanStep } from "@/components/publish/PhotoScanner";
import type { PhotoQualityResult } from "@/lib/validations";
import PhotoScanner from "@/components/publish/PhotoScanner";

type UploadSlotStatus = "idle" | "processing" | "uploading" | "uploaded" | "failed";

interface PhotoStepProps {
  currentStep: number;
  scannerErrorMessage: string | null;
  isCheckingQuality: boolean;
  currentUploadProgress: number;
  currentUploadStatus: UploadSlotStatus;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onStepChange: (step: number) => void;
  photoPreviews: string[];
  uploadProgressBySlot: number[];
  uploadStatuses: UploadSlotStatus[];
  qualityResults: (PhotoQualityResult | null)[];
  scanSteps: PublishScanStep[];
  photoCount: number;
  hasPendingPhotoUploads: boolean;
  addMoreLabel: string;
  uploadingLabel: string;
}

export default function PhotoStep({
  currentStep,
  scannerErrorMessage,
  isCheckingQuality,
  currentUploadProgress,
  currentUploadStatus,
  onFileChange,
  onReset,
  onStepChange,
  photoPreviews,
  uploadProgressBySlot,
  uploadStatuses,
  qualityResults,
  scanSteps,
  photoCount,
  hasPendingPhotoUploads,
  addMoreLabel,
  uploadingLabel,
}: PhotoStepProps) {
  return (
    <div className="space-y-5">
      <PhotoScanner
        currentStep={currentStep}
        errorMessage={scannerErrorMessage}
        isCheckingQuality={isCheckingQuality}
        currentUploadProgress={currentUploadProgress}
        currentUploadStatus={currentUploadStatus}
        onFileChange={onFileChange}
        onReset={onReset}
        onStepChange={onStepChange}
        photoPreviews={photoPreviews}
        uploadProgressByStep={uploadProgressBySlot}
        uploadStatuses={uploadStatuses}
        qualityResults={qualityResults}
        scanSteps={scanSteps}
      />

      {photoCount > 0 && photoCount < 2 ? (
        <div className="flex items-center justify-center gap-2 animate-bounce">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {addMoreLabel}
          </p>
        </div>
      ) : null}

      {hasPendingPhotoUploads ? (
        <div className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {uploadingLabel}
          </p>
        </div>
      ) : null}
    </div>
  );
}
