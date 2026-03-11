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
        <div className="group/card relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/80 bg-[#fffaf3] shadow-[0_18px_52px_rgba(16,32,58,0.09)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_66px_rgba(16,32,58,0.13)]">
          <div className="pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full bg-blue-100/55 blur-3xl" />

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
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#10203a]/70 via-[#10203a]/20 to-transparent" />
            
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
               <div className={cn(
                 "rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm backdrop-blur-md",
                 item.status === "AVAILABLE" 
                   ? "border border-emerald-100 bg-emerald-50/90 text-emerald-700" 
                   : "border border-amber-100 bg-amber-50/90 text-amber-700"
               )}>
                  {item.status === "AVAILABLE" ? t("available") : t("reserved")}
               </div>
            </div>

            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsSaved(!isSaved);
                toggleSaveItem(item.id);
              }}
              className={cn(
                "absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all backdrop-blur-md",
                isSaved 
                  ? "border-rose-600 bg-rose-500 text-white" 
                  : "border-white/70 bg-white/90 text-slate-400 hover:text-rose-500"
              )}
            >
              <Heart className={cn("w-4 h-4", isSaved && "fill-white")} />
            </button>

            <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
              <div className="rounded-[20px] border border-white/15 bg-[#10203a]/85 px-3 py-2.5 shadow-[0_16px_34px_rgba(16,32,58,0.24)] backdrop-blur-md">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/55">
                  Swaps
                </p>
                <p className="mt-1 text-sm font-black text-white">
                  {item.creditValue} <span className="text-[10px] opacity-65">CR</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/88 px-3 py-1.5 shadow-sm backdrop-blur-md">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="max-w-[90px] truncate text-[10px] font-medium text-slate-600 uppercase tracking-tight">
                  {item.locationZone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-tight tracking-[-0.03em] text-slate-900 transition-colors group-hover/card:text-primary">
                {item.title}
              </h3>
              <div className="shrink-0 rounded-full bg-[#fff0d9] px-2.5 py-1.5">
                <div className="flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-bold text-slate-700">{item.owner.trustScore}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-white/80 px-2.5 py-1.5 shadow-sm">
                <Eye className="w-3 h-3" />
                {item.views ?? 0}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-white/80 px-2.5 py-1.5 shadow-sm">
                <Heart className="w-3 h-3" />
                {item.favoritesCount ?? 0}
              </span>
            </div>

            <div className="mt-auto rounded-[22px] border border-slate-100 bg-white/75 px-3.5 py-3 shadow-[0_12px_30px_rgba(16,32,58,0.05)]">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                {t("by", { name: item.owner.username })}
              </p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="truncate text-[12px] font-black text-slate-800">{item.owner.username}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#10203a] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  {item.owner.trustScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </AnimatedItem>
  );
}
