"use client";

import { Star, Package, MapPin, Eye, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toggleSaveItem } from "@/app/actions/item";
import { AnimatedItem } from "@/components/AnimatedContainer";
import { localizeHref } from "@/lib/i18n/pathnames";
import { cn } from "@/lib/utils";

 interface Item {
  id: string;
  title: string;
  images?: Array<{ url: string; order: number }> | null;
  creditValue: number;
  locationZone: string;
  owner: {
    username: string;
    trustScore: number;
  };
  views?: number;
  favoritesCount?: number;
  distance?: number;
  functionalStatus?: string;
  status?: string;
}

export default function ItemCard({ item, index }: { item: Item, index: number }) {
  const [isSaved, setIsSaved] = useState(false); // Potential improvement: fetch actual state from prop
  const locale = useLocale();
  const t = useTranslations("itemCard");
  const primaryImage = item.images?.[0]?.url;

  return (
    <AnimatedItem index={index}>
      <Link href={localizeHref(locale, `/item/${item.id}`)} className="group block h-full">
        <div className="group/card flex h-full flex-col overflow-hidden rounded-[30px] border border-white/80 bg-[#fffaf3] shadow-[0_16px_46px_rgba(16,32,58,0.09)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(16,32,58,0.13)]">
          {/* Image Container - Larger & Fill */}
          <div className="relative aspect-[3/4] overflow-hidden bg-[#efe7d7]">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center opacity-25">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#10203a]/45 to-transparent" />
            
            {/* Status & Price Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
               <div className={cn(
                 "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm backdrop-blur-md",
                 item.status === "AVAILABLE" 
                   ? "border border-emerald-100 bg-emerald-50/90 text-emerald-700" 
                   : "border border-amber-100 bg-amber-50/90 text-amber-700"
               )}>
                  {item.status === "AVAILABLE" ? t("available") : t("reserved")}
               </div>
            </div>

            <div className="absolute top-3 right-3">
               <div className="rounded-[18px] border border-white/10 bg-[#10203a] px-3 py-2 shadow-sm">
                  <span className="text-xs font-semibold text-white">
                    {item.creditValue} <span className="text-[10px] opacity-70">CR</span>
                  </span>
               </div>
            </div>

            {/* Zone Overlay (Bottom Left) */}
            <div className="absolute bottom-3 left-3">
               <div className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/88 px-3 py-1.5 shadow-sm backdrop-blur-md">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-medium text-slate-600 uppercase tracking-tight">
                    {item.locationZone}
                  </span>
               </div>
            </div>

            {/* Save Button (Bottom Right) */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsSaved(!isSaved);
                toggleSaveItem(item.id);
              }}
              className={cn(
                "absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-all",
                isSaved 
                  ? "bg-rose-500 border-rose-600 text-white" 
                  : "bg-white border-slate-200 text-slate-400 hover:text-rose-500"
              )}
            >
              <Heart className={cn("w-4 h-4", isSaved && "fill-white")} />
            </button>
          </div>

          {/* Content - Compact & Discrete Seller */}
          <div className="flex flex-1 flex-col gap-2 p-4">
            <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-tight tracking-[-0.03em] text-slate-900 transition-colors group-hover/card:text-primary">
              {item.title}
            </h3>

            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 px-2 py-1">
                <Eye className="w-3 h-3" />
                {item.views ?? 0}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 px-2 py-1">
                <Heart className="w-3 h-3" />
                {item.favoritesCount ?? 0}
              </span>
            </div>
            
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
               <p className="text-[11px] font-semibold text-slate-500">{t("by", { name: item.owner.username })}</p>
               <div className="flex items-center gap-1 rounded-full bg-[#fff0d9] px-2 py-1">
                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-bold text-slate-700">{item.owner.trustScore}</span>
               </div>
            </div>
          </div>
        </div>
      </Link>
    </AnimatedItem>
  );
}
