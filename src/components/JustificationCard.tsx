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
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <BarChart3 className="w-5 h-5 opacity-80" />
          <h3 className="font-black text-sm uppercase tracking-wider">{t("title")}</h3>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase">{t("certified")}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Identity Card Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {t("estimatedNewPrice")}
            </p>
            <p className="text-sm font-black text-slate-900">{formatPrice(details.estimatedNewPrice)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
              <History className="w-3 h-3" />
              {t("estimatedAge")}
            </p>
            <p className="text-sm font-black text-slate-900">{details.ageEstimate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {t("visualCondition")}
            </p>
            <p className="text-sm font-black text-slate-900">{details.visualCondition}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {t("detectedWear")}
            </p>
            <p className="text-sm font-black text-slate-900">{details.wearLevel}</p>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-slate-50" />

        {/* Market Comparison */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{t("marketComparison")}</p>
            <p className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {t("similarTransactions", {count: details.similarTransactionsCount})}
            </p>
          </div>
          
          <div className="relative pt-4 pb-2">
            {/* Range Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-200" 
                style={{ 
                  marginLeft: '20%', 
                  width: '60%' 
                }} 
              />
            </div>
            
            {/* Suggeted Marker */}
            <div 
              className="absolute top-0 flex flex-col items-center -translate-x-1/2"
              style={{ left: '50%' }}
            >
              <div className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-md mb-1 shadow-lg shadow-indigo-100">
                {suggestedValue} CR
              </div>
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full border-2 border-white shadow-sm" />
            </div>

            <div className="flex justify-between mt-2">
              <span className="text-[9px] font-bold text-slate-300 uppercase">{t("resaleValue")}</span>
              <span className="text-[9px] font-bold text-slate-300 uppercase">{t("prestige")}</span>
            </div>
          </div>
        </div>

        {/* Final Conclusion Alert */}
        <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 items-start border border-slate-100/50">
          <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wide">{t("transparency")}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              {t("transparencyBody")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
