"use server";

import prisma from "@/lib/prisma";
import { getOpenAI } from "@/lib/openai";
import { getCurrentUser } from "@/lib/auth";

export async function getSwapAdvice(exchangeId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        item: true,
        requester: true,
        owner: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { sender: true }
        }
      }
    });

    if (!exchange) throw new Error("Exchange not found");

    const isOwner = exchange.ownerId === user.id;
    const partner = isOwner ? exchange.requester : exchange.owner;
    
    const chatHistory = exchange.messages
      .reverse()
      .map(m => `${m.sender.username}: ${m.body}`)
      .join("\n");

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001", // Fast and capable for this task
      messages: [
        {
          role: "system",
          content: `
Tu es l'assistant intelligent de Swaply. Ton rôle est d'aider les utilisateurs à conclure un troc de manière équitable et amicale.
L'objet en jeu est : "${exchange.item.title}" (${exchange.item.category}).
Prix affiché : ${exchange.item.priceSwaps} SC.
Valeur proposée par le demandeur : ${exchange.requesterSwaps} SC.

ANALYSE le contexte (historique de chat et détails) pour proposer 3 conseils ultra-courts et actionnables :
1. Une suggestion de prix ou de complément si nécessaire.
2. Un conseil sur le lieu ou le moment du rendez-vous.
3. Une phrase d'ouverture pour débloquer la situation ou finaliser.

Réponds uniquement en JSON valide :
{
  "suggestions": [
    { "type": "price", "text": "Propose un complément de 10 SC pour équilibrer.", "icon": "coins" },
    { "type": "meeting", "text": "Suggère un rendez-vous demain midi à la Gare.", "icon": "map-pin" },
    { "type": "social", "text": "Demande s'il y a d'autres photos de l'écran.", "icon": "camera" }
  ],
  "summary": "Résumé ultra-bref de la situation."
}
`.trim(),
        },
        {
          role: "user",
          content: `Historique récent :\n${chatHistory || "Aucun message pour l'instant."}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("IA response empty");

    return JSON.parse(content);
  } catch (error) {
    console.error("SwapAssistant Error:", error);
    return {
      suggestions: [
        { type: "social", text: "Demandez plus de détails sur l'objet.", icon: "info" },
        { type: "meeting", text: "Proposez un lieu de rencontre sécurisé.", icon: "map-pin" }
      ],
      summary: "Impossible d'analyser la situation pour le moment."
    };
  }
}
