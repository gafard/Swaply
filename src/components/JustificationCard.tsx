"use client";

import { useLocale, useTranslations } from "next-intl";

import { AIEstimation } from "@/lib/validations";
import { Info, BarChart3, Tag, History, AlertCircle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/i18n/format";

interface JustificationCardProps {
  estimation: AIEstimation;
}

export default function JustificationCard({ estimation }: JustificationCardProps) {
  const { details, suggestedValue } = estimation;
  const locale = useLocale();
  const t = useTranslations("justification");
  const formatPrice = (price: number) => formatCurrency(locale, price, "XOF");

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2 text-slate-900">
          <BarChart3 className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold">{t("title")}</h3>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
            {t("certified")}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
              <Tag className="h-3 w-3" />
              {t("estimatedNewPrice")}
            </p>
            <p className="text-sm font-semibold text-slate-900">{formatPrice(details.estimatedNewPrice)}</p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
              <History className="h-3 w-3" />
              {t("estimatedAge")}
            </p>
            <p className="text-sm font-semibold text-slate-900">{details.ageEstimate}</p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
              <AlertCircle className="h-3 w-3" />
              {t("visualCondition")}
            </p>
            <p className="text-sm font-semibold text-slate-900">{details.visualCondition}</p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
              <TrendingUp className="h-3 w-3" />
              {t("detectedWear")}
            </p>
            <p className="text-sm font-semibold text-slate-900">{details.wearLevel}</p>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-medium text-slate-500">{t("marketComparison")}</p>
            <p className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {t("similarTransactions", {count: details.similarTransactionsCount})}
            </p>
          </div>
          
          <div className="relative pt-4 pb-2">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-300" 
                style={{ 
                  marginLeft: '20%', 
                  width: '60%' 
                }} 
              />
            </div>
            
            <div 
              className="absolute top-0 flex flex-col items-center -translate-x-1/2"
              style={{ left: '50%' }}
            >
              <div className="mb-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white">
                {suggestedValue} CR
              </div>
              <div className="h-1.5 w-1.5 rounded-full border-2 border-white bg-slate-900 shadow-sm" />
            </div>

            <div className="flex justify-between mt-2">
              <span className="text-[9px] font-medium uppercase text-slate-400">{t("resaleValue")}</span>
              <span className="text-[9px] font-medium uppercase text-slate-400">{t("prestige")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
          <div className="rounded-xl border border-slate-200 bg-white p-2">
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-900">{t("transparency")}</h4>
            <p className="text-xs font-medium leading-5 text-slate-600">
              {t("transparencyBody")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
