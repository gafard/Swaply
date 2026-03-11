"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Package } from "lucide-react";

import FilterBar from "@/components/FilterBar";
import ItemCard from "@/components/ItemCard";
import SearchBar from "@/components/SearchBar";
import TopNav from "@/components/TopNav";

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

function DiscoverContent() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    country: "",
    city: "",
    zone: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });
  const observerTarget = useRef<HTMLDivElement>(null);
  const t = useTranslations("discover");

  const fetchItems = useCallback(
    async (cursor?: string | null, append = false) => {
      try {
        if (!append) {
          setLoading(true);
        }

        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (filters.country) params.set("country", filters.country);
        if (filters.city) params.set("city", filters.city);
        if (filters.zone) params.set("zone", filters.zone);
        if (filters.category) params.set("category", filters.category);
        if (filters.minPrice) params.set("minPrice", filters.minPrice);
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
        if (cursor) params.set("cursor", cursor);
        params.set("take", "12");

        const response = await fetch(`/api/search?${params}`);
        const data = await response.json();

        if (append) {
          setItems((prev) => [...prev, ...data.items]);
        } else {
          setItems(data.items);
        }

        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
        setLoadingMore(false);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters, searchQuery]
  );

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [filters]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setLoadingMore(true);
          fetchItems(nextCursor, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchItems, hasMore, loading, loadingMore, nextCursor]);

  return (
    <div className="space-y-4 px-5 pt-4">
      <SearchBar onSearch={setSearchQuery} placeholder={t("searchPlaceholder")} />
      <FilterBar onFilterChange={setFilters} />

      {!loading && items.length > 0 && (
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {t("results", { count: items.length })}
        </p>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium text-slate-500">{t("loading")}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="mb-4 h-16 w-16 text-slate-200" />
          <h3 className="mb-1 text-lg font-bold text-slate-700">{t("emptyTitle")}</h3>
          <p className="text-center text-sm text-slate-400">{t("emptyBody")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {items.map((item, index) => (
              <ItemCard key={item.id} item={item} index={index} />
            ))}
          </div>

          <div ref={observerTarget} className="py-8">
            {loadingMore && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            )}
            {!hasMore && items.length > 0 && (
              <p className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {t("endOfResults")}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  const t = useTranslations("discover");

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <TopNav unreadCount={0} user={null} showGuestActions={false} />
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium text-slate-500">{t("loadingParams")}</p>
          </div>
        }
      >
        <DiscoverContent />
      </Suspense>
    </main>
  );
}
