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
  confidence: number;
  details: {
    estimatedNewPrice: number;     // FCFA
    marketValueRange: { min: number; max: number }; // FCFA
    ageEstimate: string;           // "3 ans", "6 mois", etc.
    wearLevel: "Faible" | "Moyen" | "Élevé";
    visualCondition: string;       // "Bon", "Excellent", etc.
    similarTransactionsCount: number;
  };
};

export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
