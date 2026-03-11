import {
  AISuggestion,
  ITEM_CATEGORIES,
  PhotoQualityResult,
} from "@/lib/validations";

function normalizeToken(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeCategory(value: unknown): AISuggestion["category"] {
  const normalized = normalizeToken(value);

  const categoryMap: Record<string, AISuggestion["category"]> = {
    electronique: "Électronique",
    electronics: "Électronique",
    electronica: "Électronique",
    eletronicos: "Électronique",
    vetements: "Vêtements",
    clothing: "Vêtements",
    ropa: "Vêtements",
    roupas: "Vêtements",
    chaussures: "Chaussures",
    shoes: "Chaussures",
    zapatillas: "Chaussures",
    calcados: "Chaussures",
    livres: "Livres",
    books: "Livres",
    libros: "Livres",
    livros: "Livres",
    accessoires: "Accessoires",
    accessories: "Accessoires",
    accesorios: "Accessoires",
    acessorios: "Accessoires",
    maison: "Maison",
    home: "Maison",
    hogar: "Maison",
    casa: "Maison",
    sport: "Sport",
    sports: "Sport",
    deporte: "Sport",
    esportes: "Sport",
    autre: "Autre",
    other: "Autre",
    otro: "Autre",
    outro: "Autre",
  };

  return ITEM_CATEGORIES.includes(value as AISuggestion["category"])
    ? (value as AISuggestion["category"])
    : categoryMap[normalized] ?? "Autre";
}

function normalizeCondition(value: unknown): AISuggestion["condition"] {
  const normalized = normalizeToken(value);

  const conditionMap: Record<string, AISuggestion["condition"]> = {
    new: "new",
    neuf: "new",
    neuve: "new",
    nuevo: "new",
    nova: "new",
    like_new: "new",
    comme_neuf: "new",
    good: "good",
    bon: "good",
    bonne: "good",
    bueno: "good",
    boa: "good",
    fair: "fair",
    moyen: "fair",
    moyenne: "fair",
    regular: "fair",
    average: "fair",
    poor: "poor",
    use: "poor",
    usee: "poor",
    usé: "poor",
    usée: "poor",
    malo: "poor",
    ruim: "poor",
  };

  return conditionMap[normalized] ?? "good";
}

function normalizeVisualStatus(value: unknown): AISuggestion["visualStatus"] {
  const normalized = normalizeToken(value);

  const statusMap: Record<string, AISuggestion["visualStatus"]> = {
    perfect: "PERFECT",
    parfait: "PERFECT",
    good: "PERFECT",
    defective: "DEFECTIVE",
    defectueux: "DEFECTIVE",
    defaut: "DEFECTIVE",
    broken: "BROKEN",
    casse: "BROKEN",
    cassé: "BROKEN",
    roto: "BROKEN",
    quebrado: "BROKEN",
  };

  return statusMap[normalized] ?? "PERFECT";
}

function normalizeRarity(value: unknown): AISuggestion["rarity"] {
  const normalized = normalizeToken(value);

  const rarityMap: Record<string, AISuggestion["rarity"]> = {
    common: "common",
    low: "common",
    courant: "common",
    normal: "common",
    uncommon: "uncommon",
    medium: "uncommon",
    peu_courant: "uncommon",
    rare: "rare",
    high: "rare",
    tres_rare: "rare",
  };

  return rarityMap[normalized] ?? "common";
}

function normalizeFraudRisk(value: unknown): AISuggestion["fraudRisk"] {
  const normalized = normalizeToken(value);

  const riskMap: Record<string, AISuggestion["fraudRisk"]> = {
    low: "low",
    faible: "low",
    bajo: "low",
    medium: "medium",
    moyen: "medium",
    medio: "medium",
    high: "high",
    eleve: "high",
    élevé: "high",
    alto: "high",
  };

  return riskMap[normalized] ?? "low";
}

function normalizeConfidence(value: unknown) {
  const numeric = typeof value === "number" ? value : Number.parseFloat(String(value ?? "0"));

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0.35;
  }

  if (numeric > 1) {
    return Math.min(1, numeric / 100);
  }

  return Math.max(0, Math.min(1, numeric));
}

function normalizeFlags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export function buildFallbackSuggestion(
  partial?: Partial<AISuggestion>
): AISuggestion {
  return {
    title: partial?.title ?? "",
    description: partial?.description ?? "",
    category: partial?.category ?? "Autre",
    subcategory: partial?.subcategory ?? "Objet",
    modelGuess: partial?.modelGuess ?? null,
    brand: partial?.brand ?? "unknown",
    condition: partial?.condition ?? "good",
    visualStatus: partial?.visualStatus ?? "PERFECT",
    rarity: partial?.rarity ?? "common",
    fraudRisk: partial?.fraudRisk ?? "low",
    isStockPhoto: partial?.isStockPhoto ?? false,
    flags: partial?.flags ?? [],
    confidence: partial?.confidence ?? 0.35,
  };
}

export function normalizeAISuggestionPayload(payload: unknown): AISuggestion {
  const source =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};

  return buildFallbackSuggestion({
    title: normalizeString(source.title),
    description: normalizeString(source.description),
    category: normalizeCategory(source.category),
    subcategory: normalizeString(source.subcategory, "Objet"),
    modelGuess: normalizeString(source.modelGuess) || null,
    brand: normalizeString(source.brand, "unknown").toLowerCase(),
    condition: normalizeCondition(source.condition),
    visualStatus: normalizeVisualStatus(source.visualStatus),
    rarity: normalizeRarity(source.rarity),
    fraudRisk: normalizeFraudRisk(source.fraudRisk),
    isStockPhoto: Boolean(source.isStockPhoto),
    flags: normalizeFlags(source.flags),
    confidence: normalizeConfidence(source.confidence),
  });
}

export function normalizePhotoQualityPayload(payload: unknown): PhotoQualityResult {
  const source =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};

  const numericQuality =
    typeof source.qualityScore === "number"
      ? source.qualityScore
      : Number.parseFloat(String(source.qualityScore ?? "0.5"));

  return {
    isBlurry: Boolean(source.isBlurry),
    isStockPhoto: Boolean(source.isStockPhoto),
    isObjectVisible: source.isObjectVisible === undefined ? true : Boolean(source.isObjectVisible),
    objectDetected: normalizeString(source.objectDetected) || null,
    brandDetected: normalizeString(source.brandDetected) || null,
    qualityScore: Number.isFinite(numericQuality)
      ? Math.max(0, Math.min(1, numericQuality > 1 ? numericQuality / 100 : numericQuality))
      : 0.5,
    suggestions: normalizeFlags(source.suggestions),
    analysisError: Boolean(source.analysisError),
  };
}
