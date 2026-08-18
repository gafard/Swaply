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
      <div className="rounded-[30px] border border-border bg-surface p-5 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <Info className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              {sectionTitle}
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              {sectionSubtitle}
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-foreground" htmlFor="title">
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
              "w-full rounded-2xl border bg-surface-raised px-4 py-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10",
              clientErrors.title ? "border-danger" : "border-border"
            )}
            placeholder={titlePlaceholder}
          />
          {clientErrors.title && (
            <p id="title-error" role="alert" className="mt-1.5 text-xs font-bold text-danger">
              {clientErrors.title}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-foreground" htmlFor="description">
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
              "w-full resize-none rounded-2xl border bg-surface-raised px-4 py-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10",
              clientErrors.description ? "border-danger" : "border-border"
            )}
            placeholder={descriptionPlaceholder}
          />
          {clientErrors.description && (
            <p id="description-error" role="alert" className="mt-1.5 text-xs font-bold text-danger">
              {clientErrors.description}
            </p>
          )}
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
