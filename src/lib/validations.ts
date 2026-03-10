export const CREDIT_VALUES = [20, 100, 300] as const;

export const ITEM_CATEGORIES = [
  "Électronique",
  "Vêtements",
  "Chaussures",
  "Livres",
  "Accessoires",
  "Maison",
  "Sport",
  "Autre"
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export type AISuggestion = {
  title: string;
  description: string;
  category: ItemCategory;
  subcategory: string;
  modelGuess?: string | null;
  brand: string;
  condition: "new" | "good" | "fair" | "poor";
  visualStatus: "PERFECT" | "DEFECTIVE" | "BROKEN";
  rarity: "common" | "uncommon" | "rare";
  fraudRisk: "low" | "medium" | "high";
  isStockPhoto: boolean;
  flags: string[];
  confidence: number;
};

export type PhotoQualityResult = {
  isBlurry: boolean;
  isStockPhoto: boolean;
  isObjectVisible: boolean;
  objectDetected: string | null;
  brandDetected: string | null;
  qualityScore: number; // 0 to 1
  suggestions: string[];
};

export type AIEstimation = {
  suggestedValue: number;
  minSuggestedValue: number;
  maxSuggestedValue: number;
  explanation: string;
  confidence: number;
  techSignals?: {
    age?: string;
    accessories?: string[];
    functionality?: string;
  };
};

export function isValidCreditValue(value: number) {
  return CREDIT_VALUES.includes(value as (typeof CREDIT_VALUES)[number]);
}

export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
