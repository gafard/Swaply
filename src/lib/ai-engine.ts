"use server";

import { AISuggestion, AIEstimation, ItemCategory } from "./validations";

// Hybrid Scoring Engine - Layer 2
// Formula: Base Category * Brand Coeff * Condition Coeff * Rarity Coeff

const CATEGORY_BASE_VALUES: Record<ItemCategory, number> = {
  "Électronique": 100,
  "Vêtements": 40,
  "Chaussures": 60,
  "Livres": 20,
  "Accessoires": 30,
  "Maison": 50,
  "Sport": 70,
  "Autre": 30
};

const BRAND_COEFFICIENTS: Record<string, number> = {
  "apple": 1.5,
  "samsung": 1.2,
  "sony": 1.2,
  "nike": 1.3,
  "adidas": 1.2,
  "unknown": 1.0,
  "generic": 1.0
};

const CONDITION_COEFFICIENTS = {
  "new": 1.25,
  "good": 1.1,
  "fair": 0.8,
  "poor": 0.5
};

const RARITY_COEFFICIENTS = {
  "common": 1.0,
  "uncommon": 1.15,
  "rare": 1.3
};

const AGE_COEFFICIENTS = {
  "less_than_1_year": 1.2,
  "1_3_years": 0.9,
  "more_than_3_years": 0.6
};

const FUNCTIONALITY_COEFFICIENTS = {
  "perfect": 1.1,
  "battery_low": 0.8,
  "defect": 0.4
};

const ACCESSORY_COEFFICIENTS = {
  "box": 1.05,
  "charger": 1.1,
  "cables": 1.05
};

/**
 * Calculates a recommended credit value based on AI visual analysis and user confirmation
 */
export async function calculateAIEstimation(
  suggestion: AISuggestion, 
  techDetails?: { age?: string; accessories?: string[]; functionality?: string }
): Promise<AIEstimation> {
  const { category, brand, condition, rarity, confidence } = suggestion;

  // 1. Get Base Value
  const baseValue = CATEGORY_BASE_VALUES[category] || 30;

  // 2. Adjust by Brand
  const brandKey = brand.toLowerCase().trim();
  const brandCoeff = BRAND_COEFFICIENTS[brandKey] || 1.0;

  // 3. Adjust by Condition
  const conditionCoeff = CONDITION_COEFFICIENTS[condition] || 1.0;

  // 4. Adjust by Rarity
  const rarityCoeff = RARITY_COEFFICIENTS[rarity] || 1.0;

  // 5. Final Calculation Layer 1
  let estimated = baseValue * brandCoeff * conditionCoeff * rarityCoeff;

  // 6. Layer 2: Technical Signals (specifically for Electronics)
  if (category === "Électronique" && techDetails) {
    if (techDetails.age) {
      estimated *= (AGE_COEFFICIENTS[techDetails.age as keyof typeof AGE_COEFFICIENTS] || 1.0);
    }
    if (techDetails.functionality) {
      estimated *= (FUNCTIONALITY_COEFFICIENTS[techDetails.functionality as keyof typeof FUNCTIONALITY_COEFFICIENTS] || 1.0);
    }
    if (techDetails.accessories && techDetails.accessories.length > 0) {
      techDetails.accessories.forEach(acc => {
        estimated *= (ACCESSORY_COEFFICIENTS[acc as keyof typeof ACCESSORY_COEFFICIENTS] || 1.0);
      });
    }
  }

  estimated = Math.round(estimated);
  
  // Ensure business bounds
  if (estimated < 10) estimated = 10;
  if (estimated > 1000) estimated = 1000;

  // Generate range (±15%)
  const min = Math.max(10, Math.round(estimated * 0.85));
  const max = Math.round(estimated * 1.15);

  // Generate Explanation
  const explanation = `Basé sur : ${category} (${suggestion.subcategory || 'générique'}), marque ${brand === 'unknown' ? 'générique' : brand}, état ${condition} et rareté ${rarity}.`;

  return {
    suggestedValue: estimated,
    minSuggestedValue: min,
    maxSuggestedValue: max,
    explanation,
    confidence
  };
}
