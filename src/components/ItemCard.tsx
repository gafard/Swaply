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
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card hover:shadow-popup hover:-translate-y-1 transition-all duration-500 h-full flex flex-col group/card">
          {/* Image Container - Larger & Fill */}
          <div className="aspect-[3/4] overflow-hidden bg-slate-50 relative">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={item.title}
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
            )}
            
            {/* Status & Price Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
               <div className={cn(
                 "px-3 py-1 rounded-full shadow-sm text-[10px] font-semibold tracking-wide",
                 item.status === "AVAILABLE" 
                   ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                   : "bg-amber-50 text-amber-700 border border-amber-100"
               )}>
                  {item.status === "AVAILABLE" ? t("available") : t("reserved")}
               </div>
            </div>

            <div className="absolute top-3 right-3">
               <div className="bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl shadow-sm">
                  <span className="text-xs font-semibold text-white">
                    {item.creditValue} <span className="text-[10px] opacity-70">CR</span>
                  </span>
               </div>
            </div>

            {/* Zone Overlay (Bottom Left) */}
            <div className="absolute bottom-3 left-3">
               <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
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
                "absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all border shadow-sm",
                isSaved 
                  ? "bg-rose-500 border-rose-600 text-white" 
                  : "bg-white border-slate-200 text-slate-400 hover:text-rose-500"
              )}
            >
              <Heart className={cn("w-4 h-4", isSaved && "fill-white")} />
            </button>
          </div>

          {/* Content - Compact & Discrete Seller */}
          <div className="p-4 flex-1 flex flex-col gap-1.5">
            <h3 className="font-semibold text-sm text-slate-900 line-clamp-1 tracking-tight group-hover/card:text-primary transition-colors leading-tight">
              {item.title}
            </h3>

            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {item.views ?? 0}
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {item.favoritesCount ?? 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
               <p className="text-[11px] font-medium text-slate-500">{t("by", { name: item.owner.username })}</p>
               <div className="flex items-center gap-0.5">
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
