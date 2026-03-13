"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Package } from "lucide-react";

import DiscoveryStack from "@/components/DiscoveryStack";
import SearchBar from "@/components/SearchBar";

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

interface FilterState {
  country: string;
  city: string;
  zone: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

export default function DiscoverContent() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters] = useState<FilterState>({
    country: "",
    city: "",
    zone: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });
  const t = useTranslations("discover");

  const fetchItems = useCallback(
    async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (filters.country) params.set("country", filters.country);
        if (filters.city) params.set("city", filters.city);
        if (filters.zone) params.set("zone", filters.zone);
        if (filters.category) params.set("category", filters.category);
        if (filters.minPrice) params.set("minPrice", filters.minPrice);
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
        params.set("take", "50"); // Fetch more for swiping

        const response = await fetch(`/api/search?${params}`);
        const data = await response.json();

        setItems(data.items);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters, searchQuery]
  );

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchItems]);

  const mappedItems = items.map(item => ({
    ...item,
    imageUrl: item.images?.[0]?.url || null
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-2 px-4 pt-2 overflow-hidden">
      <div className="shrink-0">
        <SearchBar onSearch={setSearchQuery} placeholder={t("searchPlaceholder")} />
      </div>

      <div className="flex-1 relative mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted">{t("loading")}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Package className="mb-4 h-16 w-16 text-muted/20" />
            <h3 className="mb-1 text-lg font-bold text-foreground">{t("emptyTitle")}</h3>
            <p className="text-center text-sm text-muted">{t("emptyBody")}</p>
          </div>

        ) : (
          <div className="h-full">
            <DiscoveryStack items={mappedItems} key={JSON.stringify(filters) + searchQuery} />
          </div>
        )}
      </div>
    </div>
  );
}
