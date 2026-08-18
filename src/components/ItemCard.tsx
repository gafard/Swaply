"use client";

import { Star, Package, MapPin, Eye, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toggleSaveItem } from "@/app/actions/item";
import { localizeHref } from "@/lib/i18n/pathnames";
import { cn } from "@/lib/utils";
import CreditBadge from "@/components/CreditBadge";
import { calculateSwapCredit } from "@/lib/credit-score";
import SpotlightCard from "@/components/ui/SpotlightCard";
import HoloBadge from "@/components/ui/HoloBadge";

interface Item {
  id: string;
  title: string;
  images?: Array<{ url: string; order?: number }> | null;
  creditValue: number;
  locationZone: string;
  owner: {
    username: string;
    trustScore: number;
    completionRate: number;
    avgResponseTime: number;
    avgPhotoQuality: number;
    level: number;
    xp: number;
  };
  views?: number;
  favoritesCount?: number;
  distance?: number;
  functionalStatus?: string;
  status?: string;
}

export default function ItemCard({ item, index }: { item: Item; index?: number }) {
  const [isSaved, setIsSaved] = useState(false);
  const locale = useLocale();
  const t = useTranslations("itemCard");

  if (!item) return null;

  const primaryImage = item.images?.[0]?.url;
  const username = item.owner?.username ?? "Utilisateur";
  const swapCreditScore = calculateSwapCredit({
    completionRate: item.owner?.completionRate ?? 100,
    avgResponseTime: item.owner?.avgResponseTime ?? 0,
    avgPhotoQuality: item.owner?.avgPhotoQuality ?? 1,
    level: item.owner?.level ?? 1,
    xp: item.owner?.xp ?? 0,
  });

  return (
    <div className="h-full">
      <Link href={localizeHref(locale, `/item/${item.id}`)} className="group block h-full">
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.18)"
          className="h-full flex flex-col rounded-[28px] border-border bg-surface shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-300 group-hover:-translate-y-1"
        >
          {/* Image Container with Ambient Shadow */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[26px] bg-background">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={item.title || "Item"}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted">
                <Package className="w-10 h-10 opacity-30" />
              </div>
            )}

            {/* Bottom dark gradient vignette */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Top Status Tag */}
            <div className="absolute top-2.5 left-2.5 z-10">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm",
                  item.status === "AVAILABLE"
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-500 text-white"
                )}
              >
                {item.status === "AVAILABLE" ? "Disponible" : "Réservé"}
              </span>
            </div>

            {/* Favorite Action Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsSaved(!isSaved);
                toggleSaveItem(item.id);
              }}
              className={cn(
                "absolute right-2.5 top-2.5 z-10 flex h-8.5 w-8.5 items-center justify-center rounded-full border backdrop-blur-xl transition-all active:scale-90",
                isSaved
                  ? "border-rose-500 bg-rose-500 text-white shadow-sm scale-110"
                  : "border-white/30 bg-black/40 text-white hover:bg-black/60"
              )}
              aria-label="Save"
            >
              <Heart className={cn("w-4 h-4", isSaved && "fill-white")} />
            </button>

            {/* Bottom Overlay (Price & Location) */}
            <div className="absolute inset-x-2.5 bottom-2.5 flex items-end justify-between gap-2 z-10">
              <div className="rounded-2xl border border-white/25 bg-black/60 px-3 py-1.5 backdrop-blur-md shadow-sm">
                <span className="block text-[8px] font-black uppercase tracking-widest text-emerald-400">
                  Valeur
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-base font-black text-white leading-none">
                    {item.creditValue || 0}
                  </span>
                  <span className="text-[9px] font-black text-amber-400">
                    SC
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-white/90 backdrop-blur-md">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span className="max-w-[70px] truncate text-[9px] font-bold uppercase">
                  {item.locationZone || "Local"}
                </span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-1 flex-col justify-between gap-2.5 p-3.5">
            <div>
              <h3 className="line-clamp-2 font-display text-xs font-bold text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {item.title || "Sans titre"}
              </h3>
            </div>

            {/* Seller & Trust Row */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-subtle">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-[11px] font-semibold text-foreground-muted">
                  {username}
                </span>
              </div>

              <div className="flex items-center gap-0.5 shrink-0 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                  {item.owner?.trustScore ?? 0}
                </span>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </Link>
    </div>
  );
}
