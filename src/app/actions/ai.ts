"use server";

import type OpenAI from "openai";
import { getOpenAI } from "@/lib/openai";
import { ITEM_CATEGORIES, AISuggestion, AIEstimation, PhotoQualityResult } from "@/lib/validations";
import { calculateAIEstimation } from "@/lib/ai-engine";
import {
  buildFallbackSuggestion,
  normalizeAISuggestionPayload,
  normalizePhotoQualityPayload,
} from "@/lib/ai-normalization";

type MarketContext = {
  countryId?: string | null;
  cityId?: string | null;
};

type TechDetails = {
  age?: string;
  accessories?: string[];
  functionality?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Impossible d'analyser l'image";
}

const DEFAULT_VISION_MODELS = [
  process.env.OPENROUTER_VISION_MODEL,
  "qwen/qwen2.5-vl-72b-instruct",
  "google/gemini-2.0-flash-001",
  "openai/gpt-4o-mini",
].filter(Boolean) as string[];

function getVisionModels() {
  return [...new Set(DEFAULT_VISION_MODELS)];
}

function extractChatCompletionContent(response: unknown) {
  if (
    response &&
    typeof response === "object" &&
    "error" in response &&
    response.error &&
    typeof response.error === "object" &&
    "message" in response.error
  ) {
    throw new Error(String(response.error.message || "Vision provider error"));
  }

  const content =
    response &&
    typeof response === "object" &&
    "choices" in response &&
    Array.isArray(response.choices)
      ? response.choices[0]?.message?.content
      : null;

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("Réponse IA vide ou invalide");
  }

  return content;
}

async function createVisionJsonCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  maxTokens: number
) {
  const openai = getOpenAI();
  let lastError: unknown = null;

  for (const model of getVisionModels()) {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      });

      return extractChatCompletionContent(response);
    } catch (error) {
      lastError = error;
      console.error(`Swaply vision model failed (${model}):`, getErrorMessage(error));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Aucun modèle IA vision disponible");
}

export async function suggestListingFromImages(
  imagesBase64: string[],
  marketContext?: MarketContext
): Promise<Partial<AISuggestion & { estimation?: AIEstimation }>> {
  try {
    const text = await createVisionJsonCompletion([
      {
        role: "system",
        content: `
Tu es l'expert IA de Swaply, une application de troc locale multi-pays.
Ton rôle est d'analyser plusieurs photos d'un même objet (différents angles : face, arrière, détails, allumé) pour extraire ses attributs visuels précis et détecter toute fraude ou dommage :

1. CLASSIFICATION : Catégorie parmi : ${ITEM_CATEGORIES.join(", ")}.
2. SOUS-CATÉGORIE : Type précis d'objet (ex: "Casque Bluetooth", "Smartphone").
3. MODÈLE : Tente d'identifier le modèle exact (ex: "iPhone 13 Pro"). Utilise l'OCR si du texte ou des étiquettes sont visibles sur l'une des photos.
4. MARQUE : Marque visible.
5. ÉTAT : État visuel global basé sur TOUS les angles (new, good, fair, poor).
6. DOMMAGES : Détecte les rayures, fissures ou signes d'usure sur n'importe quelle photo.
7. AUTHENTICITÉ : Détecte si les photos sont réelles ou s'il s'agit d'images de stock/Internet. Plusieurs angles augmentent la confiance.

RETOURNE UNIQUEMENT UN JSON VALIDE :
{
  "title": "Titre court accrocheur (max 50 chars)",
  "description": "Description factuelle basée sur le contenu visuel (max 150 chars)",
  "category": "catégorie exacte",
  "subcategory": "type d'objet",
  "modelGuess": "modèle identifié ou null",
  "brand": "marque détectée",
  "condition": "new|good|fair|poor",
  "visualStatus": "PERFECT|DEFECTIVE|BROKEN",
  "rarity": "common|uncommon|rare",
  "fraudRisk": "low|medium|high",
  "isStockPhoto": boolean,
  "flags": ["liste de flags (ex: screen_crack, missing_parts)"],
  "confidence": number
}
`.trim(),
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyse ces photos de l'objet sous différents angles pour Swaply." },
          ...imagesBase64.map(url => ({ type: "image_url" as const, image_url: { url } })),
        ],
      },
    ], 600);

    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = normalizeAISuggestionPayload(JSON.parse(cleanedText));

    // Layer 2: Estimation Engine
    const estimation = await calculateAIEstimation(parsed, undefined, marketContext);

    return { ...parsed, estimation };
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("Swaply AI Error:", message);
    const fallback = buildFallbackSuggestion();
    const estimation = await calculateAIEstimation(fallback, undefined, marketContext);
    return {
      ...fallback,
      estimation,
    };
  }
}

export async function calculateHybridEstimation(
  suggestion: AISuggestion,
  techDetails?: TechDetails,
  marketContext?: MarketContext
): Promise<AIEstimation> {
  return calculateAIEstimation(suggestion, techDetails, marketContext);
}

export async function analyzePhotoQuality(imageBase64: string, stepIndex: number): Promise<Partial<PhotoQualityResult>> {
  try {
    const steps = [
      "Photo principale (objet entier)",
      "Côté ou arrière",
      "Détails ou défauts",
      "Objet en fonctionnement / Allumé"
    ];

    const text = await createVisionJsonCompletion([
      {
        role: "system",
        content: `
Tu es l'expert contrôle qualité de Swaply. L'utilisateur prend une photo pour l'étape : "${steps[stepIndex]}".
Analyse l'image immédiatement pour vérifier la qualité technique et le contenu :

1. FLOU : L'image est-elle nette ?
2. VISIBILITÉ : L'objet est-il bien centré et visible ?
3. AUTHENTICITÉ : Est-ce une "vraie" photo ou une capture d'écran/photo catalogue ?
4. CONTENU : Identifie brièvement l'objet et la marque s'ils sont visibles.

RETOURNE UNIQUEMENT UN JSON :
{
  "isBlurry": boolean,
  "isStockPhoto": boolean,
  "isObjectVisible": boolean,
  "objectDetected": "smartphone|tv|table|etc" ou null,
  "brandDetected": "Apple|Samsung|Sony|etc" ou null,
  "qualityScore": number (0-1),
  "suggestions": ["liste de conseils courts si besoin"]
}
`.trim(),
      },
      {
        role: "user",
        content: [
          { type: "image_url" as const, image_url: { url: imageBase64 } },
        ],
      },
    ], 300);

    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = normalizePhotoQualityPayload(JSON.parse(cleanedText));
    return parsed;
  } catch (error) {
    console.error("Quality Check Error:", error);
    return {
      isBlurry: false,
      isStockPhoto: false,
      isObjectVisible: true,
      objectDetected: null,
      brandDetected: null,
      qualityScore: 0,
      suggestions: [],
      analysisError: true,
    };
  }
}
