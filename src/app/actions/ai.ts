"use server";

import { getOpenAI } from "@/lib/openai";
import { ITEM_CATEGORIES, AISuggestion, AIEstimation, PhotoQualityResult } from "@/lib/validations";
import { calculateAIEstimation } from "@/lib/ai-engine";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Impossible d'analyser l'image";
}

export async function suggestListingFromImages(imagesBase64: string[]): Promise<Partial<AISuggestion & { estimation?: AIEstimation }>> {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "qwen/qwen-2.5-vl-7b-instruct", 
      messages: [
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
      ],
      max_tokens: 600,
      response_format: { type: "json_object" }
    });

    const text = response.choices[0].message.content || "{}";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText) as AISuggestion;

    // Layer 1 Normalization
    if (!ITEM_CATEGORIES.includes(parsed.category as any)) {
      parsed.category = "Autre";
    }
    
    // Layer 2: Estimation Engine
    const estimation = await calculateAIEstimation(parsed);

    return { ...parsed, estimation };
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("Swaply AI Error:", message);
    return {};
  }
}

export async function analyzePhotoQuality(imageBase64: string, stepIndex: number): Promise<Partial<PhotoQualityResult>> {
  try {
    const openai = getOpenAI();
    const steps = [
      "Photo principale (objet entier)",
      "Côté ou arrière",
      "Détails ou défauts",
      "Objet en fonctionnement / Allumé"
    ];

    const response = await openai.chat.completions.create({
      model: "qwen/qwen-2.5-vl-7b-instruct",
      messages: [
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
      ],
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const text = response.choices[0].message.content || "{}";
    const parsed = JSON.parse(text) as PhotoQualityResult;
    return parsed;
  } catch (error) {
    console.error("Quality Check Error:", error);
    return { qualityScore: 0.5, suggestions: ["Erreur d'analyse, essayez de rester stable."] };
  }
}
