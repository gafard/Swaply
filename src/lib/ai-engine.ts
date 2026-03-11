"use server";

import prisma from "@/lib/prisma";
import { getFromCache, setInCache } from "@/lib/cache";
import { ExchangeStatus, ItemStatus, Prisma } from "@prisma/client";
import { AISuggestion, AIEstimation, ItemCategory } from "./validations";

const CATEGORY_BASE_VALUES: Record<ItemCategory, number> = {
  "Électronique": 160,
  "Vêtements": 20,
  "Chaussures": 40,
  "Livres": 20,
  "Accessoires": 40,
  "Maison": 80,
  "Sport": 80,
  "Autre": 30,
};

const BRAND_COEFFICIENTS: Record<string, number> = {
  apple: 1.5,
  samsung: 1.2,
  sony: 1.2,
  nike: 1.3,
  adidas: 1.2,
  unknown: 1.0,
  generic: 1.0,
};

const CONDITION_COEFFICIENTS = {
  new: 1.25,
  good: 1.1,
  fair: 0.8,
  poor: 0.5,
};

const RARITY_COEFFICIENTS = {
  common: 1.0,
  uncommon: 1.15,
  rare: 1.3,
};

const AGE_COEFFICIENTS = {
  less_than_1_year: 1.2,
  "1_3_years": 0.9,
  more_than_3_years: 0.6,
};

const FUNCTIONALITY_COEFFICIENTS = {
  perfect: 1.1,
  battery_low: 0.8,
  defect: 0.4,
};

const ACCESSORY_COEFFICIENTS = {
  box: 1.05,
  charger: 1.1,
  cables: 1.05,
};

const CATEGORY_NEW_PRICES: Record<ItemCategory, number> = {
  "Électronique": 150000,
  "Vêtements": 25000,
  "Chaussures": 45000,
  "Livres": 10000,
  "Accessoires": 15000,
  "Maison": 80000,
  "Sport": 60000,
  "Autre": 30000,
};

const MARKET_CACHE_TTL_MS = 5 * 60 * 1000;
const LOOKBACK_DAYS = 365;

type TechDetails = {
  age?: string;
  accessories?: string[];
  functionality?: string;
};

type MarketContext = {
  countryId?: string | null;
  cityId?: string | null;
};

type MarketScope = "city" | "country" | "global";

type MarketAnchor = {
  anchorSwaps: number;
  rangeSwaps: { min: number; max: number };
  sampleCount: number;
  matchType: "brand" | "category";
  scope: MarketScope;
};

type ScopeFilters = {
  countryId?: string;
  cityId?: string;
};

function normalizeBrandKey(brand: string) {
  return brand.trim().toLowerCase();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function median(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }

  return sorted[middle];
}

function percentile(values: number[], ratio: number) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * ratio;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;
  return Math.round(sorted[lower] + (sorted[upper] - sorted[lower]) * weight);
}

function getScopeFilters(scope: MarketScope, marketContext?: MarketContext): ScopeFilters {
  if (scope === "city" && marketContext?.countryId && marketContext?.cityId) {
    return {
      countryId: marketContext.countryId,
      cityId: marketContext.cityId,
    };
  }

  if (scope === "country" && marketContext?.countryId) {
    return {
      countryId: marketContext.countryId,
    };
  }

  return {};
}

function getMinimumSamples(scope: MarketScope, matchType: "brand" | "category") {
  if (scope === "city") {
    return matchType === "brand" ? 4 : 6;
  }

  if (scope === "country") {
    return matchType === "brand" ? 5 : 8;
  }

  return matchType === "brand" ? 6 : 10;
}

async function fetchMarketSamples(
  category: string,
  scope: MarketScope,
  marketContext?: MarketContext,
  brand?: string | null
) {
  const filters = getScopeFilters(scope, marketContext);
  const normalizedBrand = brand?.trim();
  const cacheKey = `ai-market:${scope}:${filters.countryId || "all"}:${filters.cityId || "all"}:${category}:${normalizedBrand || "all"}`;
  const cached = getFromCache<{ listingPrices: number[]; exchangePrices: number[] }>(cacheKey);

  if (cached) {
    return cached;
  }

  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const brandFilter =
    normalizedBrand && normalizedBrand !== "unknown" && normalizedBrand !== "generic"
      ? { brand: { equals: normalizedBrand, mode: "insensitive" as const } }
      : {};

  const itemWhere: Prisma.ItemWhereInput = {
    category,
    status: { in: [ItemStatus.AVAILABLE, ItemStatus.RESERVED, ItemStatus.EXCHANGED] },
    priceSwaps: { gt: 0 },
    createdAt: { gte: since },
    ...filters,
    ...brandFilter,
  };

  const exchangeWhere: Prisma.ExchangeWhereInput = {
    status: ExchangeStatus.COMPLETED,
    createdAt: { gte: since },
    item: {
      category,
      ...filters,
      ...brandFilter,
    },
  };

  let items: Array<{ priceSwaps: number }> = [];
  let exchanges: Array<{ requesterSwaps: number; item: { priceSwaps: number } }> = [];

  try {
    [items, exchanges] = await Promise.all([
      prisma.item.findMany({
        where: itemWhere,
        select: { priceSwaps: true },
        orderBy: { createdAt: "desc" },
        take: 40,
      }),
      prisma.exchange.findMany({
        where: exchangeWhere,
        select: {
          requesterSwaps: true,
          item: {
            select: {
              priceSwaps: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 40,
      }),
    ]);
  } catch (error) {
    const errorCode =
      error && typeof error === "object" && "code" in error ? String(error.code) : "unknown";
    console.warn(
      `Swaply market layer unavailable (${scope}/${normalizedBrand || category}, ${errorCode})`
    );
    const emptyPayload = { listingPrices: [], exchangePrices: [] };
    setInCache(cacheKey, emptyPayload, 30_000);
    return emptyPayload;
  }

  const payload = {
    listingPrices: items
      .map((item) => item.priceSwaps)
      .filter((value) => Number.isFinite(value) && value > 0),
    exchangePrices: exchanges
      .map((exchange) =>
        exchange.requesterSwaps > 0 ? exchange.requesterSwaps : exchange.item.priceSwaps
      )
      .filter((value) => Number.isFinite(value) && value > 0),
  };

  setInCache(cacheKey, payload, MARKET_CACHE_TTL_MS);
  return payload;
}

async function resolveMarketAnchor(
  suggestion: AISuggestion,
  marketContext?: MarketContext
): Promise<MarketAnchor | null> {
  const brandKey = normalizeBrandKey(suggestion.brand);
  const hasSpecificBrand = brandKey.length > 0 && brandKey !== "unknown" && brandKey !== "generic";
  const scopes: MarketScope[] = marketContext?.cityId
    ? ["city", "country", "global"]
    : marketContext?.countryId
      ? ["country", "global"]
      : ["global"];

  for (const scope of scopes) {
    if (hasSpecificBrand) {
      const brandSamples = await fetchMarketSamples(
        suggestion.category,
        scope,
        marketContext,
        suggestion.brand
      );
      const brandWeighted = [
        ...brandSamples.listingPrices,
        ...brandSamples.exchangePrices,
        ...brandSamples.exchangePrices,
      ];

      if (brandWeighted.length >= getMinimumSamples(scope, "brand")) {
        return {
          anchorSwaps: median(brandWeighted),
          rangeSwaps: {
            min: percentile(brandWeighted, 0.2),
            max: percentile(brandWeighted, 0.8),
          },
          sampleCount: brandSamples.listingPrices.length + brandSamples.exchangePrices.length,
          matchType: "brand",
          scope,
        };
      }
    }

    const categorySamples = await fetchMarketSamples(
      suggestion.category,
      scope,
      marketContext
    );
    const categoryWeighted = [
      ...categorySamples.listingPrices,
      ...categorySamples.exchangePrices,
      ...categorySamples.exchangePrices,
    ];

    if (categoryWeighted.length >= getMinimumSamples(scope, "category")) {
      return {
        anchorSwaps: median(categoryWeighted),
        rangeSwaps: {
          min: percentile(categoryWeighted, 0.2),
          max: percentile(categoryWeighted, 0.8),
        },
        sampleCount: categorySamples.listingPrices.length + categorySamples.exchangePrices.length,
        matchType: "category",
        scope,
      };
    }
  }

  return null;
}

function getMarketInfluence(anchor: MarketAnchor) {
  const base =
    anchor.sampleCount >= 18 ? 0.55 : anchor.sampleCount >= 10 ? 0.42 : 0.28;
  const scopeBoost =
    anchor.scope === "city" ? 0.08 : anchor.scope === "country" ? 0.04 : 0;
  const matchBoost = anchor.matchType === "brand" ? 0.07 : 0;

  return clamp(base + scopeBoost + matchBoost, 0.2, 0.68);
}

export async function calculateAIEstimation(
  suggestion: AISuggestion,
  techDetails?: TechDetails,
  marketContext?: MarketContext
): Promise<AIEstimation> {
  const { category, brand, condition, rarity, confidence } = suggestion;

  const baseValue = CATEGORY_BASE_VALUES[category] || 30;
  const brandKey = normalizeBrandKey(brand);
  const brandCoeff = BRAND_COEFFICIENTS[brandKey] || 1.0;
  const conditionCoeff = CONDITION_COEFFICIENTS[condition] || 1.0;
  const rarityCoeff = RARITY_COEFFICIENTS[rarity] || 1.0;

  let estimated = baseValue * brandCoeff * conditionCoeff * rarityCoeff;

  if (category === "Électronique" && techDetails) {
    if (techDetails.age) {
      estimated *= AGE_COEFFICIENTS[techDetails.age as keyof typeof AGE_COEFFICIENTS] || 1.0;
    }
    if (techDetails.functionality) {
      estimated *=
        FUNCTIONALITY_COEFFICIENTS[
          techDetails.functionality as keyof typeof FUNCTIONALITY_COEFFICIENTS
        ] || 1.0;
    }
    if (techDetails.accessories && techDetails.accessories.length > 0) {
      for (const accessory of techDetails.accessories) {
        estimated *=
          ACCESSORY_COEFFICIENTS[accessory as keyof typeof ACCESSORY_COEFFICIENTS] || 1.0;
      }
    }
  }

  const marketAnchor = await resolveMarketAnchor(suggestion, marketContext);
  if (marketAnchor) {
    const marketInfluence = getMarketInfluence(marketAnchor);
    estimated = estimated * (1 - marketInfluence) + marketAnchor.anchorSwaps * marketInfluence;
  }

  estimated = clamp(Math.round(estimated), 10, 1000);

  const min = marketAnchor
    ? clamp(Math.round(marketAnchor.rangeSwaps.min * 0.7 + estimated * 0.3), 10, 1000)
    : Math.max(10, Math.round(estimated * 0.85));
  const max = marketAnchor
    ? clamp(Math.round(marketAnchor.rangeSwaps.max * 0.7 + estimated * 0.3), min + 5, 1200)
    : Math.round(estimated * 1.15);

  const basePriceNew = CATEGORY_NEW_PRICES[category] || 30000;
  const estimatedNewPriceBase = Math.round(basePriceNew * brandCoeff);
  const estimatedNewPrice = marketAnchor
    ? Math.max(
        estimatedNewPriceBase,
        Math.round(marketAnchor.anchorSwaps / Math.max(conditionCoeff, 0.55))
      )
    : estimatedNewPriceBase;

  const marketMin = marketAnchor
    ? marketAnchor.rangeSwaps.min
    : Math.round(estimatedNewPrice * 0.45);
  const marketMax = marketAnchor
    ? marketAnchor.rangeSwaps.max
    : Math.round(estimatedNewPrice * 0.65);

  const wearLevel =
    condition === "new" || condition === "good"
      ? "Faible"
      : condition === "fair"
        ? "Moyen"
        : "Élevé";

  const visualConditionMap: Record<string, string> = {
    new: "Comme neuf",
    good: "Bon état",
    fair: "État moyen",
    poor: "Usé",
  };

  const ageLabel =
    condition === "new" ? "< 6 mois" : condition === "good" ? "1-2 ans" : "3 ans+";

  return {
    suggestedValue: estimated,
    minSuggestedValue: min,
    maxSuggestedValue: max,
    confidence,
    details: {
      estimatedNewPrice,
      marketValueRange: { min: marketMin, max: marketMax },
      ageEstimate: techDetails?.age
        ? techDetails.age === "less_than_1_year"
          ? "< 1 an"
          : techDetails.age === "1_3_years"
            ? "1-3 ans"
            : "> 3 ans"
        : ageLabel,
      wearLevel: wearLevel as "Faible" | "Moyen" | "Élevé",
      visualCondition: visualConditionMap[condition] || "Correct",
      similarTransactionsCount: marketAnchor?.sampleCount ?? 0,
    },
  };
}
