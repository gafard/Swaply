"use client";

import React from "react";
import { Info } from "lucide-react";
import PricingSlider from "@/components/publish/PricingSlider";
import type { AIEstimation } from "@/lib/validations";
import { cn } from "@/lib/utils";

interface DetailsStepProps {
  title: string;
  description: string;
  creditValue: number;
  estimation?: AIEstimation;
  isOutOfRange: boolean;
  clientErrors: {
    title?: string;
    description?: string;
    creditValue?: string;
  };
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCreditValueChange: (value: number) => void;
  // i18n labels
  sectionTitle: string;
  sectionSubtitle: string;
  titleLabel: string;
  titlePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
}

export default function DetailsStep({
  title,
  description,
  creditValue,
  estimation,
  isOutOfRange,
  clientErrors,
  onTitleChange,
  onDescriptionChange,
  onCreditValueChange,
  sectionTitle,
  sectionSubtitle,
  titleLabel,
  titlePlaceholder,
  descriptionLabel,
  descriptionPlaceholder,
}: DetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm space-y-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
            <Info className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              {sectionTitle}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {sectionSubtitle}
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="title">
            {titleLabel}
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            aria-invalid={Boolean(clientErrors.title)}
            aria-describedby={clientErrors.title ? "title-error" : undefined}
            className={cn(
              "w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400",
              clientErrors.title ? "border-rose-300" : "border-slate-200"
            )}
            placeholder={titlePlaceholder}
          />
          {clientErrors.title ? (
            <p id="title-error" role="alert" className="mt-2 text-xs font-medium text-rose-600">
              {clientErrors.title}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-800" htmlFor="description">
            {descriptionLabel}
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            aria-invalid={Boolean(clientErrors.description)}
            aria-describedby={clientErrors.description ? "description-error" : undefined}
            className={cn(
              "w-full resize-none rounded-2xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400",
              clientErrors.description ? "border-rose-300" : "border-slate-200"
            )}
            placeholder={descriptionPlaceholder}
          />
          {clientErrors.description ? (
            <p id="description-error" role="alert" className="mt-2 text-xs font-medium text-rose-600">
              {clientErrors.description}
            </p>
          ) : null}
        </div>
      </div>

      <PricingSlider
        creditValue={creditValue}
        errorMessage={clientErrors.creditValue}
        estimation={estimation}
        isOutOfRange={isOutOfRange}
        onChange={onCreditValueChange}
      />
    </div>
  );
}
