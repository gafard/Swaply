"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Package, Search, X } from "lucide-react";

import DiscoveryStack from "@/components/DiscoveryStack";

interface Item {
  id: string;
  title: string;
  images?: Array<{ url: string; orderIndex: number }> | null;
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
  status?: string;
}

export default function DiscoverContent() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const t = useTranslations("discover");

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      params.set("take", "50");

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchItems]);

  const mappedItems = items.map((item) => ({
    ...item,
    imageUrl: item.images?.[0]?.url || null,
  }));

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] flex-col justify-between overflow-hidden px-3.5 pb-24 pt-1 sm:pb-28">
      {/* Compact Top Bar */}
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-purple-600 text-xs shadow-sm">
            🃏
          </span>
          <div>
            <h1 className="font-display text-base font-black tracking-tight text-foreground">
              Découvrir
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 shadow-sm">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-28 bg-transparent text-xs font-bold text-foreground outline-none sm:w-40"
              />
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="text-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm hover:text-foreground"
              aria-label="Recherche"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          <div className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Swipe 2.0
          </div>
        </div>
      </div>

      {/* Main Swiper Stage - Flex-1 takes remaining height cleanly */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-xs font-bold text-muted">{t("loading") || "Recherche des drops..."}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 rounded-[32px] border border-dashed border-border bg-surface/50">
            <Package className="mb-3 h-12 w-12 text-muted/30" />
            <h3 className="text-sm font-bold text-foreground">{t("emptyTitle") || "Aucun objet trouvé"}</h3>
            <p className="text-xs text-muted mt-1 max-w-xs">{t("emptyBody") || "Essaie de modifier tes filtres ou ta recherche."}</p>
          </div>
        ) : (
          <DiscoveryStack items={mappedItems} key={searchQuery} />
        )}
      </div>
    </div>
  );
}
