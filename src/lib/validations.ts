import { z } from "zod";

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

export const ItemCategorySchema = z.enum(ITEM_CATEGORIES);
export type ItemCategory = z.infer<typeof ItemCategorySchema>;

export const AISuggestionSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  category: ItemCategorySchema,
  subcategory: z.string(),
  modelGuess: z.string().nullish(),
  brand: z.string(),
  condition: z.enum(["new", "good", "fair", "poor"]),
  visualStatus: z.enum(["PERFECT", "DEFECTIVE", "BROKEN"]),
  rarity: z.enum(["common", "uncommon", "rare"]),
  fraudRisk: z.enum(["low", "medium", "high"]),
  isStockPhoto: z.boolean(),
  flags: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  estimation: z.any().optional(), // Re-using AIEstimationSchema if needed
});

export type AISuggestion = z.infer<typeof AISuggestionSchema>;

export const PhotoQualityResultSchema = z.object({
  isBlurry: z.boolean(),
  isStockPhoto: z.boolean(),
  isObjectVisible: z.boolean(),
  objectDetected: z.string().nullable(),
  brandDetected: z.string().nullable(),
  qualityScore: z.number().min(0).max(1),
  suggestions: z.array(z.string()),
  analysisError: z.boolean().optional(),
});

export type PhotoQualityResult = z.infer<typeof PhotoQualityResultSchema>;

export const AIEstimationSchema = z.object({
  suggestedValue: z.number().nonnegative(),
  minSuggestedValue: z.number().nonnegative(),
  maxSuggestedValue: z.number().nonnegative(),
  confidence: z.number().min(0).max(1),
  details: z.object({
    estimatedNewPrice: z.number(),
    marketValueRange: z.object({
      min: z.number(),
      max: z.number(),
    }),
    ageEstimate: z.string(),
    wearLevel: z.enum(["Faible", "Moyen", "Élevé"]),
    visualCondition: z.string(),
    similarTransactionsCount: z.number(),
  }),
});

export type AIEstimation = z.infer<typeof AIEstimationSchema>;

// Server Action Schemas
export const PublishItemSchema = z.object({
  title: z.string().min(2, "Le titre doit faire au moins 2 caractères"),
  description: z.string().min(5, "La description doit faire au moins 5 caractères").or(z.literal("")),
  priceSwaps: z.number().int().nonnegative("La valeur doit être positive"),
  imageUrls: z.array(z.string().url()).min(2, "Au moins 2 images sont requises"),
  countryId: z.string().uuid("Pays requis"),
  cityId: z.string().uuid("Ville requise"),
  zoneId: z.string().uuid("Zone requise"),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  category: ItemCategorySchema.nullable().optional(),
  brand: z.string().nullable().optional(),
  conditionLabel: z.string().nullable().optional(),
  aiSuggestedSwaps: z.number().int().nullable().optional(),
  aiConfidence: z.number().nullable().optional(),
  fraudRisk: z.string().nullable().optional(),
});

export const ReportItemSchema = z.object({
  itemId: z.string().uuid(),
  reason: z.string().min(3, "La raison doit faire au moins 3 caractères"),
  details: z.string().nullable().optional(),
});

export const ReserveItemSchema = z.object({
  itemId: z.string().uuid(),
  swapsBalance: z.number().int().nonnegative().optional().default(0),
});

export const ConfirmExchangeSchema = z.object({
  exchangeId: z.string().uuid(),
  token: z.string().length(64), // Hex string from 32 bytes
});

export const SubmitReviewSchema = z.object({
  exchangeId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).nullable().optional(),
});

export const UpdateLocationSchema = z.object({
  countryId: z.string().uuid(),
  cityId: z.string().uuid(),
  zoneId: z.string().uuid(),
});

export const TopUpSchema = z.object({
  packageId: z.string().min(1, "Package requis"),
  providerCode: z.string().min(1, "Fournisseur requis"),
  phoneNumber: z.string().optional().nullable(),
  origin: z.string().optional().nullable(),
});

export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
