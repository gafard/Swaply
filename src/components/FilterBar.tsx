"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Filter } from "lucide-react";

import { ITEM_CATEGORIES, ItemCategory } from "@/lib/validations";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  country: string;
  city: string;
  zone: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

const PRICE_RANGES = [
  { key: "all", min: "", max: "" },
  { key: "under50", min: "", max: "50" },
  { key: "range50to150", min: "50", max: "150" },
  { key: "range150to300", min: "150", max: "300" },
  { key: "over300", min: "300", max: "" },
] as const;

const CATEGORY_KEYS: Record<ItemCategory, string> = {
  "Électronique": "electronics",
  "Vêtements": "clothing",
  "Chaussures": "shoes",
  "Livres": "books",
  "Accessoires": "accessories",
  "Maison": "home",
  "Sport": "sports",
  "Autre": "other",
};

export default function FilterBar({ onFilterChange = () => {} }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [zoneOptions, setZoneOptions] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    country: "",
    city: "",
    zone: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });
  const t = useTranslations("filters");

  useEffect(() => {
    let isMounted = true;

    async function loadGeoData() {
      try {
        const response = await fetch("/api/geo", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) {
          return;
        }

        const countries = payload?.countries ?? [];
        const currentLocation = payload?.currentLocation;
        const countryNames = countries.map((country: any) => country.name).filter(Boolean);
        const currentCountry =
          countries.find((country: any) => country.id === currentLocation?.countryId) ?? countries[0];
        const cityNames = (currentCountry?.cities ?? []).map((city: any) => city.name).filter(Boolean);
        const currentCity =
          currentCountry?.cities.find((city: any) => city.id === currentLocation?.cityId) ??
          currentCountry?.cities?.[0];
        const zoneNames = (currentCity?.zones ?? []).map((zone: any) => zone.name).filter(Boolean);

        if (isMounted) {
          setCountryOptions(countryNames);
          setCityOptions(cityNames);
          setZoneOptions(zoneNames);
        }
      } catch {
        // Best effort only.
      }
    }

    loadGeoData();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateFilter = (key: keyof FilterState, value: string) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    onFilterChange?.(nextFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">{t("title")}</span>
          {activeFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t("country")}
            </label>
            <select
              value={filters.country}
              onChange={(e) => updateFilter("country", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="">{t("allCountries")}</option>
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t("city")}
            </label>
            <select
              value={filters.city}
              onChange={(e) => updateFilter("city", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="">{t("allCities")}</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t("zone")}
            </label>
            <select
              value={filters.zone}
              onChange={(e) => updateFilter("zone", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="">{t("allZones")}</option>
              {zoneOptions.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t("category")}
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="">{t("allCategories")}</option>
              {ITEM_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {t(`categories.${CATEGORY_KEYS[category]}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t("price")}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.key}
                  onClick={() => {
                    updateFilter("minPrice", range.min);
                    updateFilter("maxPrice", range.max);
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                    filters.minPrice === range.min && filters.maxPrice === range.max
                      ? "border-indigo-600 bg-indigo-500 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  {t(`ranges.${range.key}`)}
                </button>
              ))}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                const emptyFilters = {
                  country: "",
                  city: "",
                  zone: "",
                  category: "",
                  minPrice: "",
                  maxPrice: "",
                };
                setFilters(emptyFilters);
                onFilterChange?.(emptyFilters);
              }}
              className="w-full rounded-xl py-2.5 text-[11px] font-bold text-rose-500 transition-colors hover:bg-rose-50"
            >
              {t("reset")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
