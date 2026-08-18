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
        <SpotlightCard className="h-full flex flex-col rounded-[30px] border-border bg-surface shadow-md hover:shadow-lg transition-all duration-300">
          {/* Image Container with Ambient Shadow */}
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-background">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={item.title || "Item"}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted">
                <Package className="w-10 h-10 opacity-30" />
              </div>
            )}

            {/* Subtle bottom gradient vignette */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

            {/* Top Status Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
              <HoloBadge
                variant={item.status === "AVAILABLE" ? "success" : "gold"}
                size="sm"
              >
                {item.status === "AVAILABLE" ? t("available") : t("reserved")}
              </HoloBadge>
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
                "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-xl transition-all active:scale-90",
                isSaved
                  ? "border-danger bg-danger text-white shadow-sm"
                  : "border-white/30 bg-black/40 text-white/90 hover:bg-black/60"
              )}
              aria-label="Save"
            >
              <Heart className={cn("w-4 h-4", isSaved && "fill-white")} />
            </button>

            {/* Bottom Overlay Info (Price & Location) */}
            <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 z-10">
              <div className="rounded-[18px] border border-white/20 bg-black/60 px-3 py-2 backdrop-blur-md shadow-sm">
                <span className="block text-[8px] font-black uppercase tracking-widest text-white/60">
                  Valeur
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display text-base font-bold text-white leading-none">
                    {item.creditValue || 0}
                  </span>
                  <span className="text-[9px] font-black uppercase text-amber-400">
                    Swaps
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/50 px-2.5 py-1.5 text-white/90 backdrop-blur-md">
                <MapPin className="w-3 h-3 text-primary" />
                <span className="max-w-[80px] truncate text-[9px] font-bold uppercase tracking-tight">
                  {item.locationZone || "Local"}
                </span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-1 flex-col justify-between gap-3 p-4">
            <div>
              <h3 className="line-clamp-2 font-display text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                {item.title || "Sans titre"}
              </h3>
            </div>

            {/* Seller & Trust Row */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-subtle">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-xs font-semibold text-foreground-muted">
                  {username}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-foreground">
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
